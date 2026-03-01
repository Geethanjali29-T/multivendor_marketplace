from django.contrib import admin
from .models import ProductViewHistory, OrderBehaviour, UserInteractionScore


admin.site.register(ProductViewHistory)
admin.site.register(OrderBehaviour)
admin.site.register(UserInteractionScore)
