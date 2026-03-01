from django.urls import path
from apps.recommendations.views import (
    RecommendationAPIView,
    HomeRecommendationAPIView,
)

urlpatterns = [
    path(
        "recommendations/<int:product_id>/",
        RecommendationAPIView.as_view(),
        name="product-recommendations"
    ),
    path(
        "recommendations/home/",
        HomeRecommendationAPIView.as_view(),
        name="home-recommendations"
    ),
]
