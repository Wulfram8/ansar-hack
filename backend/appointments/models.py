from django.db import models
from patients.models import Patient
from django.conf import settings
from core.models import BaseModel

class Service(BaseModel):
    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    duration_min = models.IntegerField(default=30)
    price_kopecks = models.BigIntegerField(default=0)
    color_hex = models.CharField(max_length=7, default='#000000')

    def __str__(self):
        return self.title

class Appointment(BaseModel):
    STATUS_CHOICES = (
        ('CREATED', 'Created'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, related_name='appointments')
    cabinet = models.CharField(max_length=100, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    comment = models.TextField(blank=True)
    source_lead = models.ForeignKey('leads.Lead', on_delete=models.SET_NULL, null=True, blank=True, related_name='converted_appointments')
    recommended_followup_at = models.DateTimeField(null=True, blank=True)
    cancel_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Appointment {self.id} - {self.status}"

class Recommendation(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='recommendations')
    text = models.TextField()
    files = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

class FollowUp(BaseModel):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('NOTIFIED', 'Notified'),
        ('BOOKED', 'Booked'),
        ('CLOSED', 'Closed'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='followups')
    due_date = models.DateField()
    interval_label = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    source_appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_followups')

    def __str__(self):
        return f"FollowUp for {self.patient} - {self.status}"
