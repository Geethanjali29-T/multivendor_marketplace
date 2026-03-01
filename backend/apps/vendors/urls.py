from django.urls import path
from .views import (
    VendorProfileCreateView,
    ShopCreateView,
    VendorShopDetailView,
    PublicShopDetailView,
)

urlpatterns = [
    # Vendor
    path("create-profile/", VendorProfileCreateView.as_view()),
    path("create-shop/", ShopCreateView.as_view()),
    path("my-shop/", VendorShopDetailView.as_view()),

    # Public
    path("<int:pk>/", PublicShopDetailView.as_view()),
]