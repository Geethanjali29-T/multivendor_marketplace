from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/users/', include('apps.users.urls')),
    path('api/vendors/', include('apps.vendors.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path("api/", include("apps.recommendations.urls")),
    path('api/search/', include('apps.search_history.urls')),
    path('api/messages/', include('apps.messaging.urls')),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)