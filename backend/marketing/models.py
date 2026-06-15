from django.db import models
from core.models import BaseModel
from patients.models import Patient
from appointments.models import Appointment
from communications.models import Channel

class Segment(BaseModel):
    QUERY_KIND_CHOICES = (
        ('STATIC', 'Static'),
        ('DYNAMIC', 'Dynamic'),
        ('AI_GENERATED', 'AI Generated'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    query_kind = models.CharField(max_length=20, choices=QUERY_KIND_CHOICES, default='DYNAMIC')
    ast = models.JSONField(default=dict)
    refresh_interval_min = models.IntegerField(default=60)
    last_built_at = models.DateTimeField(null=True, blank=True)
    patient_count_cache = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class Campaign(BaseModel):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SCHEDULED', 'Scheduled'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('PAUSED', 'Paused'),
        ('CANCELLED', 'Cancelled'),
    )
    title = models.CharField(max_length=200)
    segment = models.ForeignKey(Segment, on_delete=models.PROTECT, related_name='campaigns')
    channels = models.ManyToManyField(Channel)
    message_template_id = models.CharField(max_length=100) # could be FK to NotificationTemplate
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    sent_count = models.IntegerField(default=0)
    open_count = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)
    booking_count = models.IntegerField(default=0)
    revenue_kopecks = models.BigIntegerField(default=0)

    def __str__(self):
        return self.title

class CampaignDelivery(BaseModel):
    STATUS_CHOICES = (
        ('QUEUED', 'Queued'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
    )
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='deliveries')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='campaign_deliveries')
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    conversion_appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    provider_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.campaign} delivery to {self.patient}"
