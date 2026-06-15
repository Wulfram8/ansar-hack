from django.db import models
from core.models import BaseModel
from django.conf import settings

class PatientSource(BaseModel):
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.title

class PatientTag(BaseModel):
    label = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#000000')

    def __str__(self):
        return self.label

class Patient(BaseModel):
    STATUS_CHOICES = (
        ('NEW', 'New'),
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ARCHIVED', 'Archived'),
        ('BLOCKED', 'Blocked'),
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patient_profile',
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20) # unique-per-clinic implies unique=True for simplicity here or handled in DB constraint
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    source = models.ForeignKey(PatientSource, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    tags = models.ManyToManyField(PatientTag, blank=True)
    last_visit_date = models.DateField(null=True, blank=True)
    next_visit_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    total_revenue_kopecks = models.BigIntegerField(default=0)
    visits_count = models.IntegerField(default=0)
    average_check_kopecks = models.BigIntegerField(default=0)
    lifetime_value_kopecks = models.BigIntegerField(default=0)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class PatientTimelineEvent(models.Model):
    TYPE_CHOICES = (
        ('CREATED', 'Created'),
        ('CALL', 'Call'),
        ('LEAD', 'Lead'),
        ('APPOINTMENT_BOOKED', 'Appointment Booked'),
        ('APPOINTMENT_COMPLETED', 'Appointment Completed'),
        ('NOTIFICATION_SENT', 'Notification Sent'),
        ('CAMPAIGN_RECEIVED', 'Campaign Received'),
        ('NOTE', 'Note'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='timeline_events')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    payload = models.JSONField(default=dict)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
