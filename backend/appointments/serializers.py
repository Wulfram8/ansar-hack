from datetime import datetime, timedelta

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
    service_price_kopecks = serializers.IntegerField(source='service.price_kopecks', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # Время окончания можно не передавать — посчитаем по длительности услуги.
    end_time = serializers.TimeField(required=False)

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

    def _ensure_end_time(self, attrs, instance=None):
        end = attrs.get('end_time') or (instance.end_time if instance else None)
        if attrs.get('end_time'):
            return attrs
        start = attrs.get('start_time') or (instance.start_time if instance else None)
        date = attrs.get('date') or (instance.date if instance else None)
        service = attrs.get('service') or (instance.service if instance else None)
        if start and date and service:
            base = datetime.combine(date, start)
            attrs['end_time'] = (base + timedelta(minutes=service.duration_min or 30)).time()
        elif not end:
            raise serializers.ValidationError(
                {'end_time': 'Укажите время окончания или выберите услугу с длительностью.'}
            )
        return attrs

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        attrs = self._ensure_end_time(attrs, instance)
        start = attrs.get('start_time') or (instance.start_time if instance else None)
        end = attrs.get('end_time') or (instance.end_time if instance else None)
        if start and end and end <= start:
            raise serializers.ValidationError(
                {'end_time': 'Время окончания должно быть позже начала.'}
            )
        # Проверка пересечения по врачу в один день (исключая отменённые и саму запись).
        doctor = attrs.get('doctor') or (instance.doctor if instance else None)
        date = attrs.get('date') or (instance.date if instance else None)
        if doctor and date and start and end:
            qs = Appointment.objects.filter(doctor=doctor, date=date).exclude(status='CANCELLED')
            if instance:
                qs = qs.exclude(pk=instance.pk)
            for other in qs:
                if start < other.end_time and end > other.start_time:
                    raise serializers.ValidationError(
                        {'start_time': 'Врач уже занят в это время.'}
                    )
        return attrs
