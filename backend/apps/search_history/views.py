from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.products.models import Product
from .models import SearchHistory


class ProductSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        user = request.user
        product = get_object_or_404(Product, id=product_id)

        # Save search
        SearchHistory.objects.create(
            user=user,
            product=product,
            keyword=product.name,
            city="Hyderabad"
        )

        return Response({
            "message": "Search saved",
            "product": product.name
        })