from django.contrib import admin
from .models import Channel, Message, CallLog


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ('code',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'lead', 'channel', 'direction', 'status', 'sent_at', 'created_at')
    list_filter = ('direction', 'status', 'channel')
    search_fields = ('subject', 'body', 'provider_id')


@admin.register(CallLog)
class CallLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'lead', 'direction', 'result', 'duration_sec', 'started_at')
    list_filter = ('direction', 'result')
    search_fields = ('transcript',)
