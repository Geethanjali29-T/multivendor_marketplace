from django.urls import path
from .views import RegisterUserView, ProfileView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='user-register'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
]