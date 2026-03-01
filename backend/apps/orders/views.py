from django.db import transaction
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Cart, CartItem, Order, OrderItem, ReturnRequest
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import Product
from apps.vendors.models import Shop
from apps.users.permissions import IsVendor


# =========================
# CART VIEWS (BUYER ONLY)
# =========================

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if self.request.user.role != 'BUYER':
            raise ValidationError("Only buyers can view cart")

        cart, _ = Cart.objects.get_or_create(buyer=self.request.user)
        return cart


class AddToCartView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != 'BUYER':
            raise ValidationError("Only buyers can add items to cart")

        cart, _ = Cart.objects.get_or_create(buyer=user)

        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        if product.stock < quantity:
            raise ValidationError("Not enough stock available")

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()


class RemoveFromCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        if request.user.role != 'BUYER':
            raise ValidationError("Only buyers can remove cart items")

        cart = Cart.objects.get(buyer=request.user)
        item_id = kwargs.get('item_id')

        CartItem.objects.filter(cart=cart, id=item_id).delete()
        return Response({"message": "Item removed from cart"})


# =========================
# CHECKOUT & ORDER SPLIT
# =========================

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user

        if user.role != 'BUYER':
            raise ValidationError("Only buyers can checkout")

        cart = Cart.objects.filter(buyer=user).first()
        if not cart or not cart.items.exists():
            raise ValidationError("Cart is empty")

        shop_map = {}

        for item in cart.items.all():
            shop = item.product.shop
            shop_map.setdefault(shop, []).append(item)

        created_orders = []

        for shop, items in shop_map.items():
            total_amount = sum(
                item.product.price * item.quantity for item in items
            )

            order = Order.objects.create(
                buyer=user,
                shop=shop,
                total_amount=total_amount,
                status='ORDERED'
            )

            for item in items:
                if item.product.stock < item.quantity:
                    raise ValidationError(
                        f"Insufficient stock for {item.product.name}"
                    )

                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price
                )

                product = item.product
                product.stock -= item.quantity
                product.save()

            created_orders.append(order.id)

        cart.items.all().delete()

        return Response({
            "message": "Order placed successfully",
            "orders_created": created_orders
        })


# =========================
# VENDOR ORDER STATUS UPDATE
# =========================

class VendorOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]

    def patch(self, request, order_id):
        status = request.data.get("status")

        if status not in ['PROCESSING', 'SHIPPED', 'DELIVERED']:
            raise ValidationError("Invalid order status")

        try:
            order = Order.objects.get(
                id=order_id,
                shop__vendor__user=request.user
            )
        except Order.DoesNotExist:
            raise ValidationError("Order not found for this vendor")

        order.status = status
        order.save()

        return Response({
            "message": "Order status updated",
            "order_id": order.id,
            "new_status": order.status
        })


# =========================
# BUYER ORDER HISTORY
# =========================

class BuyerOrderHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'BUYER':
            raise ValidationError("Only buyers can view order history")

        return Order.objects.filter(
            buyer=self.request.user
        ).order_by('-created_at')


# =========================
# MARK ORDER AS RECEIVED
# =========================

class MarkOrderReceivedView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        user = request.user

        if user.role != 'BUYER':
            raise ValidationError("Only buyers can mark order as received")

        try:
            order = Order.objects.get(id=order_id, buyer=user)
        except Order.DoesNotExist:
            raise ValidationError("Order not found")

        if order.status != 'DELIVERED':
            raise ValidationError("Order must be delivered before marking as received")

        order.status = 'RECEIVED'
        order.save()

        return Response({
            "message": "Order marked as received",
            "order_id": order.id
        })


# =========================
# CREATE RETURN REQUEST
# =========================

class CreateReturnRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_item_id):
        user = request.user
        reason = request.data.get("reason")

        if user.role != 'BUYER':
            raise ValidationError("Only buyers can request return")

        if not reason:
            raise ValidationError("Return reason is required")

        try:
            order_item = OrderItem.objects.get(
                id=order_item_id,
                order__buyer=user,
                order__status='RECEIVED'
            )
        except OrderItem.DoesNotExist:
            raise ValidationError("Return allowed only after order is received")

        ReturnRequest.objects.create(
            order_item=order_item,
            reason=reason
        )

        return Response({"message": "Return request submitted"})