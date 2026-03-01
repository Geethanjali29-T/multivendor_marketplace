from django.contrib import admin
from .models import VendorProfile, Shop


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'is_verified')
    list_filter = ('is_verified',)


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'vendor', 'is_active', 'created_at')
    list_filter = ('is_active',)