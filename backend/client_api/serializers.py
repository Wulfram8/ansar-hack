from rest_framework import serializers
from patients.models import Patient
from accounts.models import Doctor, User
from appointments.models import Appointment, Service
from leads.models import Lead


# ── Auth ──────────────────────────────────────────────────────────────

class SendOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)


class VerifyOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    code = serializers.CharField(max_length=10)


# ── Profile ───────────────────────────────────────────────────────────

class ClientProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'first_name', 'last_name', 'gender', 'phone']


# ── Doctors ───────────────────────────────────────────────────────────

class DoctorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'middle_name']


class DoctorListSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    middle_name = serializers.CharField(source='user.middle_name', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'first_name', 'last_name', 'middle_name',
            'specialty', 'cabinet', 'color_hex',
        ]


# ── Appointments ──────────────────────────────────────────────────────

class ServiceBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'title', 'category', 'duration_min', 'price_kopecks']


class ClientAppointmentCreateSerializer(serializers.ModelSerializer):
    """Write-only serializer for creating appointments from the client app."""

    class Meta:
        model = Appointment
        fields = [
            'doctor', 'date', 'start_time', 'end_time',
            'service', 'comment',
        ]

    def create(self, validated_data):
        # patient is always set from the authenticated user
        patient = self.context['request'].user.patient_profile
        validated_data['patient'] = patient
        return super().create(validated_data)


class DoctorBriefSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'first_name', 'last_name', 'specialty']


class ClientAppointmentListSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing appointments in the client app."""
    doctor_detail = serializers.SerializerMethodField()
    service_detail = ServiceBriefSerializer(source='service', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'status', 'comment', 'cabinet',
            'doctor_detail', 'service_detail',
            'created_at',
        ]

    def get_doctor_detail(self, obj):
        # obj.doctor is a User; find the Doctor profile if it exists
        try:
            doctor_profile = obj.doctor.doctor_profile
            return DoctorBriefSerializer(doctor_profile).data
        except Doctor.DoesNotExist:
            return {
                'id': str(obj.doctor.id),
                'first_name': obj.doctor.first_name,
                'last_name': obj.doctor.last_name,
                'specialty': '',
            }


# ── Leads ─────────────────────────────────────────────────────────────

class ClientLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'first_name', 'last_name', 'phone', 'email',
            'notes', 'channel',
        ]
