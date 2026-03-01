from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError

from apps.users.permissions import IsVendor
from apps.vendors.models import Shop
from .models import Product, Category
from .serializers import ProductSerializer


# =========================
# CREATE PRODUCT (Vendor Only)
# =========================

class ProductCreateView(generics.CreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsVendor]

    def perform_create(self, serializer):
        try:
            shop = Shop.objects.get(vendor__user=self.request.user)
        except Shop.DoesNotExist:
            raise ValidationError("Vendor must create a shop before adding products")

        serializer.save(shop=shop)


# =========================
# PUBLIC PRODUCT LIST
# =========================

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        return queryset.order_by("-created_at")


# =========================
# PRODUCT DETAIL
# =========================

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


# =========================
# VENDOR PRODUCT LIST
# =========================

class VendorProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        return Product.objects.filter(
            shop__vendor__user=self.request.user
        ).order_by("-created_at")