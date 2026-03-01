from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    buyer = serializers.ReadOnlyField(source='buyer.username')
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = Review
        fields = [
            'id',
            'buyer',
            'product',
            'product_name',
            'rating',
            'comment',
            'created_at',
            'updated_at'
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5"
            )
        return value