from django.db.models import Avg, Count
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer
from apps.products.models import Product
from apps.orders.models import OrderItem


# =========================
# ADD REVIEW (BUYER + PURCHASE CHECK)
# =========================

class AddReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != 'BUYER':
            raise ValidationError("Only buyers can add reviews")

        product_id = self.request.data.get('product')
        product = Product.objects.get(id=product_id)

        # Buyer must have purchased product
        has_purchased = OrderItem.objects.filter(
            order__buyer=user,
            product=product
        ).exists()

        if not has_purchased:
            raise ValidationError(
                "You can review this product only after purchasing it"
            )

        # One review per product per buyer
        if Review.objects.filter(buyer=user, product=product).exists():
            raise ValidationError("You already reviewed this product")

        serializer.save(buyer=user, product=product)


# =========================
# EDIT / DELETE REVIEW (BUYER ONLY)
# =========================

class ReviewUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    queryset = Review.objects.all()

    def perform_update(self, serializer):
        review = self.get_object()

        if self.request.user != review.buyer:
            raise PermissionDenied("You can edit only your own review")

        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.buyer:
            raise PermissionDenied("You can delete only your own review")

        instance.delete()


# =========================
# LIST REVIEWS (PUBLIC)
# =========================

class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return Review.objects.filter(product_id=product_id)


# =========================
# AVERAGE RATING (PUBLIC)
# =========================

class ProductRatingSummaryView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        stats = Review.objects.filter(product_id=product_id).aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id')
        )

        return Response({
            "product_id": product_id,
            "average_rating": round(stats['average_rating'] or 0, 1),
            "total_reviews": stats['total_reviews']
        })