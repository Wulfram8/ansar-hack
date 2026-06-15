from django.db import models

class AppointmentDailyAgg(models.Model):
    date = models.DateField()
    clinic = models.CharField(max_length=100)
    doctor = models.CharField(max_length=100)
    service = models.CharField(max_length=100)
    total_appointments = models.IntegerField(default=0)
    completed_appointments = models.IntegerField(default=0)
    cancelled_appointments = models.IntegerField(default=0)
    no_show_appointments = models.IntegerField(default=0)

    class Meta:
        unique_together = ('date', 'clinic', 'doctor', 'service')

class PatientFlowAgg(models.Model):
    date = models.DateField()
    clinic = models.CharField(max_length=100)
    source = models.CharField(max_length=100)
    new_patients = models.IntegerField(default=0)
    active_patients = models.IntegerField(default=0)

    class Meta:
        unique_together = ('date', 'clinic', 'source')

class RevenueAgg(models.Model):
    date = models.DateField()
    clinic = models.CharField(max_length=100)
    doctor = models.CharField(max_length=100)
    service = models.CharField(max_length=100)
    revenue_kopecks = models.BigIntegerField(default=0)

    class Meta:
        unique_together = ('date', 'clinic', 'doctor', 'service')
