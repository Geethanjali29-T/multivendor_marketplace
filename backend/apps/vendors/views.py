from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from apps.users.permissions import IsVendor
from .models import VendorProfile, Shop
from .serializers import VendorProfileSerializer, ShopSerializer


# =========================
# CREATE VENDOR PROFILE
# =========================

class VendorProfileCreateView(generics.CreateAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [IsVendor]

    def perform_create(self, serializer):
        user = self.request.user

        if VendorProfile.objects.filter(user=user).exists():
            raise ValidationError("Vendor profile already exists")

        serializer.save(user=user)


# =========================
# CREATE SHOP
# =========================

class ShopCreateView(generics.CreateAPIView):
    serializer_class = ShopSerializer
    permission_classes = [IsVendor]

    def perform_create(self, serializer):
        try:
            vendor_profile = VendorProfile.objects.get(user=self.request.user)
        except VendorProfile.DoesNotExist:
            raise ValidationError("Create vendor profile before creating a shop")

        if hasattr(vendor_profile, "shop"):
            raise ValidationError("Shop already exists")

        serializer.save(vendor=vendor_profile)


# =========================
# VENDOR SHOP DETAIL
# =========================

class VendorShopDetailView(generics.RetrieveAPIView):
    serializer_class = ShopSerializer
    permission_classes = [IsVendor]

    def get_object(self):
        return Shop.objects.get(vendor__user=self.request.user)


# =========================
# PUBLIC SHOP DETAIL
# =========================

class PublicShopDetailView(generics.RetrieveAPIView):
    queryset = Shop.objects.filter(is_active=True)
    serializer_class = ShopSerializer
    permission_classes = [AllowAny]