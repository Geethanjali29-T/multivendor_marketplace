import pickle
import os

from apps.user_behaviour.models import UserInteractionScore
from apps.search_history.models import SearchHistory
from apps.products.models import Product

MODEL_PATH = "apps/recommendations/model.pkl"


# -------------------------------------------------
# PHASE 1: CONTENT-BASED SIMILARITY
# -------------------------------------------------
def get_similar_products(product_id, top_n=5):
    if not os.path.exists(MODEL_PATH):
        return []

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    products = model["products"]
    similarity = model["similarity_matrix"]

    index = None
    for i, product in enumerate(products):
        if product["id"] == product_id:
            index = i
            break

    if index is None:
        return []

    scores = list(enumerate(similarity[index]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    recommendations = []
    for i, score in scores[1: top_n + 1]:
        recommendations.append({
            "id": products[i]["id"],
            "name": products[i]["name"],
            "similarity": float(score)
        })

    return recommendations


# -------------------------------------------------
# PHASE 2: USER BEHAVIOUR BOOST
# -------------------------------------------------
def apply_user_behavior(user, products):
    boosted = []

    for product in products:
        interaction = UserInteractionScore.objects.filter(
            user=user,
            product_id=product["id"]
        ).first()

        behavior_score = interaction.score if interaction else 0

        boosted.append({
            **product,
            "behavior_score": behavior_score,
            "final_score": product["similarity"] + behavior_score
        })

    boosted.sort(key=lambda x: x["final_score"], reverse=True)
    return boosted


# -------------------------------------------------
# PHASE 3: CITY-LEVEL FILTERING
# -------------------------------------------------
def apply_city_filter(user, products):
    latest_search = SearchHistory.objects.filter(
        user=user
    ).order_by("-searched_at").first()

    # If user never searched → skip city filter
    if not latest_search:
        return products

    user_city = latest_search.city.lower()
    filtered = []

    for item in products:
        try:
            product = Product.objects.get(id=item["id"])
            vendor_address = product.shop.vendor.address.lower()

            if user_city in vendor_address:
                filtered.append(item)

        except Product.DoesNotExist:
            continue

    return filtered


# -------------------------------------------------
# FINAL HYBRID RECOMMENDATION
# -------------------------------------------------
def get_hybrid_recommendations(user, product_id, top_n=5):
    phase1 = get_similar_products(product_id, top_n)
    phase2 = apply_user_behavior(user, phase1)
    phase3 = apply_city_filter(user, phase2)
    return phase3


# -------------------------------------------------
# HOMEPAGE RECOMMENDATION (NO PRODUCT ID)
# -------------------------------------------------
def get_homepage_recommendations(user, top_n=5):
    interaction = (
        UserInteractionScore.objects
        .filter(user=user)
        .order_by("-score")
        .first()
    )

    if interaction:
        return get_hybrid_recommendations(
            user=user,
            product_id=interaction.product.id,
            top_n=top_n
        )

    # New user fallback
    products = Product.objects.filter(
        is_active=True
    ).order_by("-created_at")[:top_n]

    return [
        {
            "id": p.id,
            "name": p.name,
            "similarity": 0.0,
            "behavior_score": 0.0,
            "final_score": 0.0
        }
        for p in products
    ]
