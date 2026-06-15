from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import NotificationTemplate, AutomationRule, ScheduledNotification
from .serializers import (
    NotificationTemplateSerializer,
    AutomationRuleSerializer,
    ScheduledNotificationSerializer
)

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'code']

class AutomationRuleViewSet(viewsets.ModelViewSet):
    queryset = AutomationRule.objects.all()
    serializer_class = AutomationRuleSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'trigger_kind']

class ScheduledNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledNotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status']

    def get_queryset(self):
        # Using patient's phone/email could be mapped to user, but let's allow admins/doctors to see all for now,
        # or filter by something relevant. Since ScheduledNotification doesn't have a direct user FK, 
        # we will return all if the user is authenticated (they should be admin or doctor).
        return ScheduledNotification.objects.all()
