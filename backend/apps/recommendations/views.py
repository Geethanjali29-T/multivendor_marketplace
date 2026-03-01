from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.recommendations.recommend import get_hybrid_recommendations
from apps.products.models import Product


class RecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        user = request.user

        recommendations = get_hybrid_recommendations(
            user=user,
            product_id=product_id,
            top_n=5
        )

        return Response({
            "product_id": product_id,
            "recommendations": recommendations
        })


class HomeRecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # fallback: recommend based on latest product
        latest_product = Product.objects.order_by("-created_at").first()

        if not latest_product:
            return Response({"recommendations": []})

        recommendations = get_hybrid_recommendations(
            user=user,
            product_id=latest_product.id,
            top_n=10
        )

        return Response({
            "recommendations": recommendations
        })
