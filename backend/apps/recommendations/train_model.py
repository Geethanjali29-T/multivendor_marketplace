import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from apps.products.models import Product
from .utils import clean_text


def train_recommendation_model():
    products = Product.objects.filter(is_active=True)

    corpus = []
    product_data = []

    for product in products:
        text = f"{product.name} {product.description}"
        text = clean_text(text)

        corpus.append(text)
        product_data.append({
            "id": product.id,
            "name": product.name
        })

    if not corpus:
        print("⚠️ No products found. Add products before training.")
        return

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    similarity_matrix = cosine_similarity(tfidf_matrix)

    model = {
        "products": product_data,
        "similarity_matrix": similarity_matrix
    }

    with open("apps/recommendations/model.pkl", "wb") as f:
        pickle.dump(model, f)

    print("✅ Phase-1 Recommendation model trained successfully")
