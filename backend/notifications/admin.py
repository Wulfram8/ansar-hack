from django.contrib import admin
from .models import NotificationTemplate, AutomationRule, ScheduledNotification

admin.site.register(NotificationTemplate)
admin.site.register(AutomationRule)
admin.site.register(ScheduledNotification)
