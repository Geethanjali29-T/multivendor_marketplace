from django.urls import path
from .views import (
    CartDetailView,
    AddToCartView,
    RemoveFromCartView,
    CheckoutView,
    VendorOrderStatusUpdateView,
    BuyerOrderHistoryView,
    MarkOrderReceivedView,
    CreateReturnRequestView,
)

urlpatterns = [

    # =====================
    # CART
    # =====================
    path("cart/", CartDetailView.as_view()),
    path("cart/add/", AddToCartView.as_view()),
    path("cart/remove/<int:item_id>/", RemoveFromCartView.as_view()),

    # =====================
    # CHECKOUT
    # =====================
    path("checkout/", CheckoutView.as_view()),

    # =====================
    # BUYER
    # =====================
    path("my-orders/", BuyerOrderHistoryView.as_view()),
    path("mark-received/<int:order_id>/", MarkOrderReceivedView.as_view()),
    path("return/<int:order_item_id>/", CreateReturnRequestView.as_view()),

    # =====================
    # VENDOR
    # =====================
    path("vendor/update-status/<int:order_id>/", VendorOrderStatusUpdateView.as_view()),
]