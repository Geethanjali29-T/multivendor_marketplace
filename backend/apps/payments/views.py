from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Payment
from apps.orders.models import Order


class MakePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method')

        if payment_method not in ['COD', 'DUMMY']:
            raise ValidationError("Invalid payment method")

        try:
            order = Order.objects.get(id=order_id, buyer=user)
        except Order.DoesNotExist:
            raise ValidationError("Order not found")

        # Prevent duplicate payment
        if hasattr(order, 'payment'):
            raise ValidationError("Payment already done for this order")

        # -------------------------
        # CASH ON DELIVERY
        # -------------------------
        if payment_method == 'COD':
            payment = Payment.objects.create(
                order=order,
                amount=order.total_amount,
                payment_method='COD',
                status='COD_PENDING'
            )

            order.status = 'CONFIRMED'
            order.save()

            return Response({
                "message": "Cash on Delivery selected",
                "order_id": order.id,
                "payment_status": payment.status
            })

        # -------------------------
        # DUMMY ONLINE PAYMENT
        # -------------------------
        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            payment_method='DUMMY',
            status='SUCCESS'   # Always success (dummy)
        )

        order.status = 'CONFIRMED'
        order.save()

        return Response({
            "message": "Dummy payment successful",
            "order_id": order.id,
            "payment_status": payment.status
        })