from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel

class Role(BaseModel):
    CODE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('MANAGER', 'Manager'),
    )
    code = models.CharField(max_length=20, choices=CODE_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    # permissions = models.ManyToManyField('auth.Permission', blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser, BaseModel):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    middle_name = models.CharField(max_length=100, blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    mfa_secret = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class Clinic(BaseModel):
    name = models.CharField(max_length=200)
    address = models.TextField()
    timezone = models.CharField(max_length=100, default='UTC')
    working_hours_default = models.JSONField(default=dict)

    def __str__(self):
        return self.name

class Doctor(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.CharField(max_length=200)
    cabinet = models.CharField(max_length=100)
    color_hex = models.CharField(max_length=7, default='#000000')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    license_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Dr. {self.user.last_name}"

class AuditLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    target_type = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    diff = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
