from django.db import models
from core.models import BaseModel
from django.conf import settings
from patients.models import Patient
from leads.models import Lead

class Channel(models.Model):
    CODE_CHOICES = (
        ('CALL', 'Call'),
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('WHATSAPP', 'WhatsApp'),
        ('TELEGRAM', 'Telegram'),
    )
    code = models.CharField(max_length=20, choices=CODE_CHOICES, unique=True)
    
    def __str__(self):
        return self.code

class Message(BaseModel):
    DIRECTION_CHOICES = (
        ('IN', 'Incoming'),
        ('OUT', 'Outgoing'),
    )
    STATUS_CHOICES = (
        ('QUEUED', 'Queued'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
        ('FAILED', 'Failed'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    attachments = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    provider_id = models.CharField(max_length=100, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    result = models.JSONField(default=dict)

class CallLog(BaseModel):
    DIRECTION_CHOICES = (
        ('IN', 'Incoming'),
        ('OUT', 'Outgoing'),
    )
    RESULT_CHOICES = (
        ('ANSWERED', 'Answered'),
        ('MISSED', 'Missed'),
        ('BUSY', 'Busy'),
        ('REJECTED', 'Rejected'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='call_logs')
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='call_logs')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    duration_sec = models.IntegerField(default=0)
    recording_url = models.URLField(blank=True)
    transcript = models.TextField(blank=True)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField()
