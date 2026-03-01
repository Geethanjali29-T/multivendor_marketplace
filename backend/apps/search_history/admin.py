from django.contrib import admin
from .models import SearchHistory


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "keyword", "city", "searched_at")
    search_fields = ("keyword", "city", "user__username", "product__name")
    list_filter = ("city", "searched_at")
