from django.contrib import admin
from .models import PatientSource, PatientTag, Patient, PatientTimelineEvent


@admin.register(PatientSource)
class PatientSourceAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'created_at')
    search_fields = ('code', 'title')


@admin.register(PatientTag)
class PatientTagAdmin(admin.ModelAdmin):
    list_display = ('label', 'color', 'created_at')
    search_fields = ('label',)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone', 'email', 'status', 'source', 'last_visit_date', 'visits_count', 'total_revenue_kopecks')
    list_filter = ('status', 'source', 'gender')
    search_fields = ('first_name', 'last_name', 'phone', 'email')


@admin.register(PatientTimelineEvent)
class PatientTimelineEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'type', 'actor', 'created_at')
    list_filter = ('type',)
    search_fields = ('patient__first_name', 'patient__last_name')
