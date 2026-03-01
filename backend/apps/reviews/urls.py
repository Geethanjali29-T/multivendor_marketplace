from django.urls import path
from .views import (
    AddReviewView,
    ReviewUpdateDeleteView,
    ProductReviewListView,
    ProductRatingSummaryView
)

urlpatterns = [
    # Add review
    path('add/', AddReviewView.as_view(), name='add-review'),

    # Edit / delete review
    path(
        '<int:pk>/',
        ReviewUpdateDeleteView.as_view(),
        name='review-update-delete'
    ),

    # List product reviews
    path(
        'product/<int:product_id>/',
        ProductReviewListView.as_view(),
        name='product-reviews'
    ),

    # Average rating
    path(
        'product/<int:product_id>/rating/',
        ProductRatingSummaryView.as_view(),
        name='product-rating-summary'
    ),
]