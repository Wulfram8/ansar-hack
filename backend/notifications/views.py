from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import NotificationTemplate, AutomationRule, ScheduledNotification
from .serializers import (
    NotificationTemplateSerializer,
    AutomationRuleSerializer,
    ScheduledNotificationSerializer,
)


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all().order_by('title')
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    search_fields = ['title', 'code']
    filterset_fields = ['is_active']


class AutomationRuleViewSet(viewsets.ModelViewSet):
    queryset = AutomationRule.objects.select_related('template').all().order_by('-created_at')
    serializer_class = AutomationRuleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ['is_active', 'trigger_kind', 'template']


class ScheduledNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledNotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'channel']

    def get_queryset(self):
        return (
            ScheduledNotification.objects
            .select_related('patient', 'channel', 'rule__template')
            .all()
            .order_by('send_at')
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Отменить запланированное уведомление."""
        obj = self.get_object()
        if obj.status not in ('PENDING', 'FAILED'):
            return Response({'detail': 'Можно отменить только ожидающие или ошибочные.'},
                            status=status.HTTP_400_BAD_REQUEST)
        obj.status = 'CANCELLED'
        obj.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Перезапланировать ошибочное/отменённое уведомление."""
        obj = self.get_object()
        obj.status = 'PENDING'
        obj.last_error = ''
        obj.attempts = 0
        if obj.send_at and obj.send_at < timezone.now():
            obj.send_at = timezone.now()
        obj.save(update_fields=['status', 'last_error', 'attempts', 'send_at', 'updated_at'])
        return Response(self.get_serializer(obj).data)
