from django.contrib import admin
from .models import DoctorSchedule, ScheduleException


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'weekday', 'start_time', 'end_time', 'active_from', 'active_to')
    list_filter = ('weekday', 'doctor')


@admin.register(ScheduleException)
class ScheduleExceptionAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'type', 'start_time', 'end_time', 'reason')
    list_filter = ('type', 'date', 'doctor')
    search_fields = ('reason',)
