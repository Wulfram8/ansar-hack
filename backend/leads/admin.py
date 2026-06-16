from django.contrib import admin
from .models import Lead, LeadActivity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'phone', 'channel', 'status', 'assigned_admin', 'created_at')
    list_filter = ('status', 'channel', 'source')
    search_fields = ('first_name', 'last_name', 'phone', 'email')


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'lead', 'kind', 'actor', 'created_at')
    list_filter = ('kind',)
    search_fields = ('lead__first_name', 'lead__last_name')
