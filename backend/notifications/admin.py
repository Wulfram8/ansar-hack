from django.contrib import admin
from .models import (
    NotificationTemplate,
    AutomationRule,
    ScheduledNotification,
    PatientNotification,
)

admin.site.register(NotificationTemplate)
admin.site.register(AutomationRule)
admin.site.register(ScheduledNotification)


@admin.register(PatientNotification)
class PatientNotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('title', 'body', 'patient__first_name', 'patient__last_name', 'patient__phone')
    raw_id_fields = ('patient', 'appointment')
    date_hierarchy = 'created_at'
