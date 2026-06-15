from django.db import models
from core.models import BaseModel
from django.conf import settings
from patients.models import Patient, PatientSource
from appointments.models import Appointment, Service

class Lead(BaseModel):
    CHANNEL_CHOICES = (
        ('SITE', 'Site'),
        ('CALL', 'Call'),
        ('WHATSAPP', 'WhatsApp'),
        ('TELEGRAM', 'Telegram'),
        ('EMAIL', 'Email'),
        ('INSTAGRAM', 'Instagram'),
        ('OTHER', 'Other'),
    )
    STATUS_CHOICES = (
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('INTERESTED', 'Interested'),
        ('APPOINTMENT_BOOKED', 'Appointment Booked'),
        ('LOST', 'Lost'),
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    source = models.ForeignKey(PatientSource, on_delete=models.SET_NULL, null=True, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='OTHER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    assigned_admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    estimated_value_kopecks = models.BigIntegerField(default=0)
    service_interest = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    utm = models.JSONField(default=dict)
    lost_reason = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    converted_patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='origin_leads')
    converted_appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='origin_leads')

    def __str__(self):
        return f"Lead {self.first_name} - {self.status}"

class LeadActivity(models.Model):
    KIND_CHOICES = (
        ('NOTE', 'Note'),
        ('CALL', 'Call'),
        ('MESSAGE', 'Message'),
        ('STATUS_CHANGE', 'Status Change'),
        ('ASSIGN', 'Assign'),
        ('REMINDER', 'Reminder'),
    )
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    payload = models.JSONField(default=dict)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
