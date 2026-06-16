from rest_framework import serializers
from .models import NotificationTemplate, AutomationRule, ScheduledNotification


class NotificationTemplateSerializer(serializers.ModelSerializer):
    rules_count = serializers.SerializerMethodField()

    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        extra_kwargs = {'channels': {'required': False}}

    def get_rules_count(self, obj):
        return obj.rules.count()


class AutomationRuleSerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source='template.title', read_only=True, default=None)
    trigger_display = serializers.CharField(source='get_trigger_kind_display', read_only=True)

    class Meta:
        model = AutomationRule
        fields = '__all__'


class ScheduledNotificationSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    channel_code = serializers.CharField(source='channel.code', read_only=True, default=None)
    template_title = serializers.CharField(source='rule.template.title', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ScheduledNotification
        fields = '__all__'

    def get_patient_name(self, obj):
        p = obj.patient
        if not p:
            return None
        return " ".join(filter(None, [p.last_name, p.first_name]))
