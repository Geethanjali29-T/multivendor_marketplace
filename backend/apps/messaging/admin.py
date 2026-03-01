from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "order", "is_read", "timestamp")
    search_fields = ("sender__username", "receiver__username")
    list_filter = ("is_read", "timestamp")