"""Сериализаторы чата пациент↔клиника для сотрудников CRM."""
from rest_framework import serializers

from .models import DoctorChat, DoctorChatMessage


class StaffChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorChatMessage
        fields = ['id', 'sender_role', 'content', 'created_at']


class StaffChatListSerializer(serializers.ModelSerializer):
    patient_id = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    needs_reply = serializers.SerializerMethodField()

    class Meta:
        model = DoctorChat
        fields = [
            'id', 'appointment', 'patient_id', 'patient_name',
            'doctor_name', 'last_message', 'needs_reply', 'created_at',
        ]

    def get_patient_id(self, obj):
        return str(obj.patient_id)

    def get_patient_name(self, obj):
        p = obj.patient
        return f"{p.last_name} {p.first_name}".strip() or p.phone

    def get_doctor_name(self, obj):
        d = obj.doctor
        return f"{d.last_name} {d.first_name}".strip() or d.get_username()

    def get_last_message(self, obj):
        m = obj.messages.last()  # Meta.ordering = ['created_at']
        if not m:
            return None
        return {
            'content': m.content,
            'sender_role': m.sender_role,
            'created_at': m.created_at,
        }

    def get_needs_reply(self, obj):
        # Последнее слово за пациентом — диалог ждёт ответа клиники.
        m = obj.messages.last()
        return bool(m and m.sender_role == 'PATIENT')


class StaffChatDetailSerializer(StaffChatListSerializer):
    messages = StaffChatMessageSerializer(many=True, read_only=True)

    class Meta(StaffChatListSerializer.Meta):
        fields = StaffChatListSerializer.Meta.fields + ['messages']


class StaffReplySerializer(serializers.Serializer):
    content = serializers.CharField()
