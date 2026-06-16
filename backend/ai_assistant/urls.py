from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet, AssistantSuggestionsView

router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")

urlpatterns = [
    path("suggestions/", AssistantSuggestionsView.as_view(), name="assistant-suggestions"),
    path("", include(router.urls)),
]
