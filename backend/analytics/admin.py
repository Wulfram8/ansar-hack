from django.contrib import admin
from .models import AppointmentDailyAgg, PatientFlowAgg, RevenueAgg


@admin.register(AppointmentDailyAgg)
class AppointmentDailyAggAdmin(admin.ModelAdmin):
    list_display = ('date', 'clinic', 'doctor', 'service', 'total_appointments', 'completed_appointments', 'cancelled_appointments', 'no_show_appointments')
    list_filter = ('date', 'clinic', 'doctor')
    search_fields = ('clinic', 'doctor', 'service')


@admin.register(PatientFlowAgg)
class PatientFlowAggAdmin(admin.ModelAdmin):
    list_display = ('date', 'clinic', 'source', 'new_patients', 'active_patients')
    list_filter = ('date', 'clinic', 'source')
    search_fields = ('clinic', 'source')


@admin.register(RevenueAgg)
class RevenueAggAdmin(admin.ModelAdmin):
    list_display = ('date', 'clinic', 'doctor', 'service', 'revenue_kopecks')
    list_filter = ('date', 'clinic', 'doctor')
    search_fields = ('clinic', 'doctor', 'service')
