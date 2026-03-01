from django.urls import path
from .views import ProductSearchAPIView

urlpatterns = [
    path("search/<int:product_id>/", ProductSearchAPIView.as_view()),
]