from django.urls import path
from .views import MessageListCreateView, MarkMessageReadView

urlpatterns = [
    path("", MessageListCreateView.as_view()),
    path("mark-read/<int:pk>/", MarkMessageReadView.as_view()),
]