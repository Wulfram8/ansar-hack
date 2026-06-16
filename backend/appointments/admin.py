from django.contrib import admin
from .models import Service, Appointment, Recommendation, FollowUp


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'category', 'duration_min', 'price_kopecks', 'color_hex')
    list_filter = ('category',)
    search_fields = ('code', 'title')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'service', 'date', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'date', 'doctor')
    search_fields = ('patient__first_name', 'patient__last_name', 'comment')


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'created_at')
    search_fields = ('text',)


@admin.register(FollowUp)
class FollowUpAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'due_date', 'interval_label', 'status', 'source_appointment')
    list_filter = ('status',)
    search_fields = ('patient__first_name', 'patient__last_name')
