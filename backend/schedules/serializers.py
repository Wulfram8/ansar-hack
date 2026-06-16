from rest_framework import serializers


class BlockSerializer(serializers.Serializer):
    """Блок записи в дне врача (позиция в % от рабочего окна 08:00–20:00)."""
    start = serializers.CharField()
    end = serializers.CharField()
    left_pct = serializers.FloatField()
    width_pct = serializers.FloatField()
    patient = serializers.CharField(allow_null=True)
    patient_id = serializers.CharField(allow_null=True)
    appointment_id = serializers.CharField(allow_null=True)
    service = serializers.CharField(allow_null=True)
    status = serializers.CharField()


class DayCellSerializer(serializers.Serializer):
    date = serializers.DateField()
    is_off = serializers.BooleanField()
    off_label = serializers.CharField(allow_null=True)
    blocks = BlockSerializer(many=True)


class DoctorRowSerializer(serializers.Serializer):
    id = serializers.CharField()
    user_id = serializers.CharField()
    name = serializers.CharField()
    initials = serializers.CharField()
    specialty = serializers.CharField()
    color = serializers.CharField()
    load_percent = serializers.IntegerField()
    days = DayCellSerializer(many=True)


class DayHeaderSerializer(serializers.Serializer):
    weekday = serializers.CharField()
    date_label = serializers.CharField()
    date = serializers.DateField()
    is_today = serializers.BooleanField()


class FreeSlotDaySerializer(serializers.Serializer):
    label = serializers.CharField()
    count = serializers.IntegerField()


class LoadBarSerializer(serializers.Serializer):
    initials = serializers.CharField()
    percent = serializers.IntegerField()
    color = serializers.CharField()


class TimeOffSerializer(serializers.Serializer):
    name = serializers.CharField()
    detail = serializers.CharField()
    kind = serializers.CharField()
    color = serializers.CharField()


class ScheduleBoardSerializer(serializers.Serializer):
    week_label = serializers.CharField()
    week_start = serializers.DateField()
    day_headers = DayHeaderSerializer(many=True)
    doctors = DoctorRowSerializer(many=True)
    free_slots_total = serializers.IntegerField()
    free_slots_delta = serializers.IntegerField()
    free_slots_by_day = FreeSlotDaySerializer(many=True)
    load_avg = serializers.FloatField()
    load_bars = LoadBarSerializer(many=True)
    time_off = TimeOffSerializer(many=True)


# --- CRUD-сериализаторы графиков и исключений ---

class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        from .models import DoctorSchedule
        model = DoctorSchedule
        fields = [
            'id', 'doctor', 'doctor_name', 'weekday', 'start_time', 'end_time',
            'break_start', 'break_end', 'active_from', 'active_to', 'created_at',
        ]

    def get_doctor_name(self, obj):
        u = obj.doctor.user
        return " ".join(filter(None, [u.last_name, u.first_name])) or u.get_username()


class ScheduleExceptionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        from .models import ScheduleException
        model = ScheduleException
        fields = [
            'id', 'doctor', 'doctor_name', 'date', 'type', 'type_display',
            'start_time', 'end_time', 'reason', 'created_at',
        ]

    def get_doctor_name(self, obj):
        u = obj.doctor.user
        return " ".join(filter(None, [u.last_name, u.first_name])) or u.get_username()
