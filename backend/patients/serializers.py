from rest_framework import serializers
from .models import Patient
from leads.models import Lead
from appointments.models import Appointment

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
