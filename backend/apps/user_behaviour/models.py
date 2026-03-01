from django.db import models
from django.conf import settings
from apps.products.models import Product

User = settings.AUTH_USER_MODEL


# -------------------------
# PRODUCT VIEW HISTORY
# -------------------------
class ProductViewHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} viewed {self.product}"


# -------------------------
# ORDER BEHAVIOUR
# -------------------------
class OrderBehaviour(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    ordered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} ordered {self.product}"


# -------------------------
# USER INTERACTION SCORE
# -------------------------
class UserInteractionScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    view_count = models.PositiveIntegerField(default=0)
    order_count = models.PositiveIntegerField(default=0)

    score = models.FloatField(default=0.0)  # computed later

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} → {self.product} ({self.score})"
