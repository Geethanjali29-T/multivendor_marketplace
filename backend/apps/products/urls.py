from django.urls import path
from .views import (
    ProductCreateView,
    ProductListView,
    ProductDetailView,
    VendorProductListView,
)

urlpatterns = [
    # Public
    path("", ProductListView.as_view()),
    path("<int:pk>/", ProductDetailView.as_view()),

    # Vendor
    path("vendor/my-products/", VendorProductListView.as_view()),
    path("vendor/create/", ProductCreateView.as_view()),
]