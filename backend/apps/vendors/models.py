from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class VendorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'VENDOR'}
    )
    phone = models.CharField(max_length=15)
    address = models.TextField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


class Shop(models.Model):
    vendor = models.OneToOneField(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='shop'
    )
    shop_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.shop_name