from django.contrib import admin
from .models import Segment, Campaign, CampaignDelivery


@admin.register(Segment)
class SegmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'query_kind', 'patient_count_cache', 'last_built_at', 'created_at')
    list_filter = ('query_kind',)
    search_fields = ('title', 'description')


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'segment', 'status', 'scheduled_at', 'sent_count', 'open_count', 'booking_count', 'revenue_kopecks')
    list_filter = ('status',)
    search_fields = ('title',)


@admin.register(CampaignDelivery)
class CampaignDeliveryAdmin(admin.ModelAdmin):
    list_display = ('id', 'campaign', 'patient', 'channel', 'status', 'sent_at', 'opened_at', 'clicked_at')
    list_filter = ('status', 'channel')
    search_fields = ('provider_id',)
