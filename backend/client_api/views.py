from datetime import date

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from accounts.models import Doctor, User
from patients.models import Patient
from appointments.models import Appointment
from leads.models import Lead

from django.db import transaction
from core.phone import normalize_phone
from patients.services import (
    find_or_create_patient_by_phone,
    find_patient_by_phone,
    link_open_leads_to_patient,
)

from .serializers import (
    SendOtpSerializer,
    VerifyOtpSerializer,
    ClientProfileSerializer,
    DoctorListSerializer,
    ClientAppointmentCreateSerializer,
    ClientAppointmentListSerializer,
    ClientLeadSerializer,
)

HARDCODED_OTP = '333333'


# ── Auth ──────────────────────────────────────────────────────────────

class SendOtpView(APIView):
    """
    Accept a phone number and pretend to send an OTP.
    In production this would integrate with an SMS provider.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # No real SMS — OTP is always 333333
        return Response(
            {'detail': 'OTP sent.', 'phone': serializer.validated_data['phone']},
            status=status.HTTP_200_OK,
        )


class VerifyOtpView(APIView):
    """
    Verify the OTP code (always 333333).
    Finds or creates a Patient + linked User by phone, returns an auth token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = normalize_phone(serializer.validated_data['phone'])
        code = serializer.validated_data['code']

        if code != HARDCODED_OTP:
            return Response(
                {'detail': 'Invalid OTP code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not phone:
            return Response(
                {'detail': 'Invalid phone number.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Пациент ищется/создаётся по нормализованному телефону —
            # один номер = один пациент, даже если заявка приходила в др. формате.
            patient, created = find_or_create_patient_by_phone(phone)

            # Гарантируем привязанного User для токен-авторизации.
            if patient.user is None:
                user = User.objects.create_user(
                    username=f'client_{phone}',
                    phone=phone,
                    # email уникален в модели — даём детерминированный плейсхолдер.
                    email=f'{phone}@clients.local',
                    password=None,  # no password, token-only auth
                )
                patient.user = user
                patient.save(update_fields=['user'])
            else:
                user = patient.user

            # Привязываем все открытые заявки с этим телефоном к пациенту.
            link_open_leads_to_patient(patient, actor=user)

            # Get or create auth token
            token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'patient_id': str(patient.id),
            'is_profile_complete': bool(patient.first_name and patient.last_name),
        })


# ── Profile ───────────────────────────────────────────────────────────

class ClientProfileView(generics.RetrieveUpdateAPIView):
    """
    GET / PUT the authenticated patient's profile.
    Only first_name, last_name, gender are writable.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ClientProfileSerializer

    def get_object(self):
        return self.request.user.patient_profile


# ── Doctors ───────────────────────────────────────────────────────────

class DoctorListView(generics.ListAPIView):
    """
    List all doctors. Supports `?search=` on name and specialty.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorListSerializer

    def get_queryset(self):
        qs = Doctor.objects.select_related('user').all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(specialty__icontains=search)
            )
        return qs


class DoctorDetailView(generics.RetrieveAPIView):
    """Single doctor detail."""
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorListSerializer
    queryset = Doctor.objects.select_related('user').all()


# ── Appointments ──────────────────────────────────────────────────────

class ClientAppointmentListCreateView(generics.ListCreateAPIView):
    """
    GET  — list the authenticated patient's appointments.
           Supports `?period=past` or `?period=future` query param.
    POST — create a new appointment for the authenticated patient.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClientAppointmentCreateSerializer
        return ClientAppointmentListSerializer

    def get_queryset(self):
        patient = self.request.user.patient_profile
        qs = Appointment.objects.filter(patient=patient).select_related(
            'doctor', 'service',
        ).order_by('-date', '-start_time')

        period = self.request.query_params.get('period')
        today = date.today()
        if period == 'past':
            qs = qs.filter(date__lt=today)
        elif period == 'future':
            qs = qs.filter(date__gte=today)

        return qs


class ClientAppointmentDetailView(generics.RetrieveAPIView):
    """Single appointment detail — scoped to the authenticated patient."""
    permission_classes = [IsAuthenticated]
    serializer_class = ClientAppointmentListSerializer

    def get_queryset(self):
        patient = self.request.user.patient_profile
        return Appointment.objects.filter(patient=patient).select_related(
            'doctor', 'service',
        )


# ── Leads ─────────────────────────────────────────────────────────────

class ClientLeadCreateView(generics.CreateAPIView):
    """
    Submit lead information. No authentication required.

    Если пациент с таким телефоном уже существует — заявка сразу
    привязывается к нему (Lead.converted_patient), чтобы менеджер
    видел, что это уже знакомый клиент.
    """
    permission_classes = [AllowAny]
    serializer_class = ClientLeadSerializer
    queryset = Lead.objects.all()

    def perform_create(self, serializer):
        lead = serializer.save()
        patient = find_patient_by_phone(lead.phone)
        if patient:
            lead.converted_patient = patient
            lead.save(update_fields=['converted_patient', 'updated_at'])
