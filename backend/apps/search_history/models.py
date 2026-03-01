from django.db import models
from django.conf import settings
from apps.products.models import Product

User = settings.AUTH_USER_MODEL


class SearchHistory(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="search_history"
    )
    keyword = models.CharField(max_length=255)
    product = models.ForeignKey(
    Product,
    on_delete=models.CASCADE,
    null=True,
    blank=True,
    related_name="searches"
    )
    city = models.CharField(max_length=100)
    searched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.product:
            return f"{self.user} searched {self.product.name} in {self.city}"
        return f"{self.user} searched '{self.keyword}' in {self.city}"
