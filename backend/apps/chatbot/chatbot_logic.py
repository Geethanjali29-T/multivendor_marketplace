from .nlp_utils import preprocess_text


def get_chatbot_response(message):
    message = preprocess_text(message)

    # -------------------
    # Greetings
    # -------------------
    if any(word in message for word in ['hi', 'hello', 'hey']):
        return "Hello 👋 Welcome to our local marketplace. How can I help you?"

    # -------------------
    # City / Local delivery
    # -------------------
    if 'city' in message or 'town' in message or 'local' in message:
        return (
            "Yes ✅ this is a city-based marketplace. "
            "Vendors mainly deliver within your city or nearby areas."
        )

    if 'delivery available' in message or 'deliver to my area' in message:
        return (
            "Delivery is available for most local areas. "
            "Exact availability depends on the vendor location."
        )

    if 'same day delivery' in message:
        return (
            "Some local vendors may offer same-day or next-day delivery "
            "within the city, depending on availability."
        )

    # -------------------
    # Order related
    # -------------------
    if 'order status' in message or 'my order' in message:
        return (
            "You can check your order status in the Orders section. "
            "Status includes Ordered, Processing, Shipped, and Delivered."
        )

    if 'cancel order' in message:
        return (
            "Orders can be cancelled before they are shipped. "
            "Please check your order status in the dashboard."
        )

    # -------------------
    # Payment related
    # -------------------
    if 'cash on delivery' in message or 'cod' in message:
        return (
            "Yes 👍 Cash on Delivery is available for most local orders."
        )

    if 'payment' in message or 'online payment' in message:
        return (
            "We support Cash on Delivery and Dummy Online Payment "
            "(for academic demonstration purposes)."
        )

    # -------------------
    # Return & refund
    # -------------------
    if 'return' in message or 'refund' in message:
        return (
            "Products can be returned within 7 days of delivery. "
            "Local vendors usually arrange pickup from your address."
        )

    # -------------------
    # Vendor related
    # -------------------
    if 'vendor' in message or 'shop' in message:
        return (
            "This platform supports multiple local vendors. "
            "Each vendor manages their own shop and products."
        )

    # -------------------
    # Product related
    # -------------------
    if 'product availability' in message or 'stock' in message:
        return (
            "Product availability depends on the vendor stock. "
            "Out-of-stock items cannot be ordered."
        )

    # -------------------
    # Default fallback
    # -------------------
    return (
        "Sorry 😅 I couldn't understand that. "
        "You can ask about orders, delivery, payments, vendors, or returns."
    )