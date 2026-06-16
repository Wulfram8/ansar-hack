from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from . import services
from .models import Conversation
from .serializers import (
    ConversationSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
    SendMessageSerializer,
    SuggestionSerializer,
)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    Диалоги пользователя с AI-ассистентом.

    list/retrieve — история; create — новый диалог с приветствием;
    POST {id}/send/ — отправить сообщение и получить ответ ассистента.
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects.filter(user=self.request.user, deleted_at__isnull=True)
            .prefetch_related("messages")
            .order_by("-updated_at")
        )

    def get_serializer_class(self):
        if self.action in ("retrieve", "send"):
            return ConversationDetailSerializer
        return ConversationSerializer

    def create(self, request, *args, **kwargs):
        conversation = services.create_conversation(
            user=request.user,
            title=request.data.get("title", ""),
        )
        data = ConversationDetailSerializer(conversation).data
        return Response(data, status=status.HTTP_201_CREATED)

    @extend_schema(request=SendMessageSerializer, responses=MessageSerializer)
    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        conversation = self.get_object()
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assistant_message = services.send_message(
            conversation=conversation,
            user=request.user,
            content=serializer.validated_data["content"],
        )
        return Response(MessageSerializer(assistant_message).data, status=status.HTTP_201_CREATED)


class AssistantSuggestionsView(APIView):
    """Каталог подсказок-промптов для левой панели ассистента."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=SuggestionSerializer(many=True))
    def get(self, request):
        data = SuggestionSerializer(services.list_suggestions(), many=True).data
        return Response(data)
