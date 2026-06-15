from django.db import models
from core.models import BaseModel
from accounts.models import Doctor

class DoctorSchedule(BaseModel):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    weekday = models.IntegerField(help_text="0=Monday, 6=Sunday")
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    active_from = models.DateField(null=True, blank=True)
    active_to = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Schedule for {self.doctor} on day {self.weekday}"

class ScheduleException(BaseModel):
    TYPE_CHOICES = (
        ('DAY_OFF', 'Day Off'),
        ('VACATION', 'Vacation'),
        ('SICK', 'Sick'),
        ('BLOCKED', 'Blocked'),
    )
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedule_exceptions')
    date = models.DateField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    reason = models.TextField(blank=True)

    def __str__(self):
        return f"Exception for {self.doctor} on {self.date}"
