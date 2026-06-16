from django.contrib import admin
from .models import Channel, Message, CallLog, DoctorChat, DoctorChatMessage


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


class DoctorChatMessageInline(admin.TabularInline):
    model = DoctorChatMessage
    extra = 0
    fields = ('sender_role', 'sender', 'content', 'created_at')
    readonly_fields = ('created_at',)
    raw_id_fields = ('sender',)


@admin.register(DoctorChat)
class DoctorChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'appointment', 'created_at')
    search_fields = (
        'patient__first_name', 'patient__last_name', 'patient__phone',
        'doctor__first_name', 'doctor__last_name',
    )
    raw_id_fields = ('patient', 'doctor', 'appointment')
    date_hierarchy = 'created_at'
    inlines = [DoctorChatMessageInline]


@admin.register(DoctorChatMessage)
class DoctorChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender_role', 'sender', 'short_content', 'created_at')
    list_filter = ('sender_role',)
    search_fields = ('content',)
    raw_id_fields = ('chat', 'sender')
    date_hierarchy = 'created_at'

    @admin.display(description='content')
    def short_content(self, obj):
        return (obj.content[:60] + '…') if len(obj.content) > 60 else obj.content
