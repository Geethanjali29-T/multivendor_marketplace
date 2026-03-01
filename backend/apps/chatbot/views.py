from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .chatbot_logic import get_chatbot_response


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message')

        if not message:
            raise ValidationError("Message is required")

        reply = get_chatbot_response(message)

        return Response({
            "user_message": message,
            "bot_reply": reply
        })