from rest_framework import serializers
from .models import VendorProfile, Shop


class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ('id', 'phone', 'address', 'is_verified')


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ('id', 'shop_name', 'description', 'is_active')