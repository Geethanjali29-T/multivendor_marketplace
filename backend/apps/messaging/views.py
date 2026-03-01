from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .models import Message
from .serializers import MessageSerializer


# =========================
# LIST + CREATE MESSAGES
# =========================

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            sender=user
        ) | Message.objects.filter(
            receiver=user
        )

    def perform_create(self, serializer):
        receiver = serializer.validated_data.get("receiver")

        if receiver == self.request.user:
            raise ValidationError("You cannot message yourself")

        serializer.save(sender=self.request.user)


# =========================
# MARK MESSAGE AS READ
# =========================

class MarkMessageReadView(generics.UpdateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        message = self.get_object()

        if message.receiver != self.request.user:
            raise ValidationError("You can only mark your messages as read")

        serializer.save(is_read=True)