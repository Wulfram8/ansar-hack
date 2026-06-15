from django.db import models
from core.models import BaseModel
from patients.models import Patient
from appointments.models import Appointment
from communications.models import Channel

class NotificationTemplate(BaseModel):
    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    body = models.TextField()
    channels = models.ManyToManyField(Channel)
    variables = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class AutomationRule(BaseModel):
    TRIGGER_CHOICES = (
        ('BEFORE_APPOINTMENT', 'Before Appointment'),
        ('AFTER_APPOINTMENT', 'After Appointment'),
        ('AFTER_CANCEL', 'After Cancel'),
        ('FOLLOWUP_DUE', 'Followup Due'),
        ('CUSTOM', 'Custom'),
    )
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, related_name='rules')
    trigger_kind = models.CharField(max_length=50, choices=TRIGGER_CHOICES)
    offset_minutes = models.IntegerField(default=0)
    conditions = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.template.title} - {self.trigger_kind}"

class ScheduledNotification(BaseModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    )
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='scheduled_notifications')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='scheduled_notifications')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    send_at = models.DateTimeField()
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payload = models.JSONField(default=dict)
    attempts = models.IntegerField(default=0)
    last_error = models.TextField(blank=True)

    def __str__(self):
        return f"Notification for {self.patient} via {self.channel} at {self.send_at}"
