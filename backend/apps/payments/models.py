import uuid
from django.db import models
from apps.orders.models import Order


class Payment(models.Model):

    PAYMENT_METHOD_CHOICES = (
        ('COD', 'Cash On Delivery'),
        ('DUMMY', 'Dummy Online Payment'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('COD_PENDING', 'COD Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHOD_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES
    )

    transaction_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.status}"