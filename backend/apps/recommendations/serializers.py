from rest_framework import serializers


class RecommendationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    similarity = serializers.FloatField()
    behavior_score = serializers.FloatField()
    final_score = serializers.FloatField()
