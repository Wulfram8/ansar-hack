from rest_framework import serializers
from .models import Appointment, Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'code', 'title', 'category', 'duration_min', 'price_kopecks', 'color_hex']


class AppointmentSerializer(serializers.ModelSerializer):
    # Человекочитаемые представления связей (для таблицы записей).
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    service_title = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_patient_name(self, obj):
        p = obj.patient
        if not p:
            return None
        return " ".join(filter(None, [p.last_name, p.first_name, p.middle_name]))

    def get_doctor_name(self, obj):
        u = obj.doctor
        if not u:
            return None
        return " ".join(filter(None, [u.last_name, u.first_name])) or u.username

    def get_service_title(self, obj):
        return obj.service.title if obj.service else None
