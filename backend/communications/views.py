"""Чат пациент↔клиника для сотрудников CRM: просмотр диалогов и ответы."""
from django.db.models import Max
from django.db.models.functions import Coalesce
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DoctorChat, DoctorChatMessage
from .serializers import (
    StaffChatListSerializer,
    StaffChatDetailSerializer,
    StaffChatMessageSerializer,
    StaffReplySerializer,
)


class StaffChatViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Диалоги пациентов с клиникой.
      - GET  /api/chats/            — список диалогов (?patient=<uuid> — фильтр)
      - GET  /api/chats/{id}/       — переписка целиком
      - POST /api/chats/{id}/reply/ — ответ от лица клиники (sender_role=DOCTOR)
    """
    permission_classes = [IsAuthenticated]
    pagination_class = None
    search_fields = [
        'patient__first_name', 'patient__last_name', 'patient__phone',
        'doctor__first_name', 'doctor__last_name',
    ]
    filterset_fields = ['patient', 'appointment']

    def get_queryset(self):
        return (
            DoctorChat.objects
            .select_related('patient', 'doctor')
            .prefetch_related('messages')
            # Сортировка инбокса — по времени последней активности.
            .annotate(last_activity=Coalesce(Max('messages__created_at'), 'created_at'))
            .order_by('-last_activity')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StaffChatDetailSerializer
        return StaffChatListSerializer

    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        chat = self.get_object()
        serializer = StaffReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = DoctorChatMessage.objects.create(
            chat=chat,
            sender_role='DOCTOR',
            sender=request.user,
            content=serializer.validated_data['content'],
        )
        return Response(
            StaffChatMessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )
