import csv
import io

from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Patient, PatientSource, PatientTag
from .serializers import (
    PatientSerializer,
    PatientSourceSerializer,
    PatientTagSerializer,
)
from .filters import PatientFilter


class PatientPagination(PageNumberPagination):
    """Пагинация списка пациентов: ?page= & ?page_size=. Ответ — {count, results}."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# Колонки CSV для импорта/экспорта (порядок фиксирован).
CSV_FIELDS = [
    "last_name", "first_name", "middle_name", "phone", "email",
    "birth_date", "gender", "address", "status", "notes",
]


class PatientViewSet(viewsets.ModelViewSet):
    # distinct() — чтобы join по тегам (M2M) не дублировал строки при фильтре по тегу.
    queryset = Patient.objects.all().order_by('last_name', 'first_name').distinct()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PatientPagination
    # Поля модели: phone (не phone_number), birth_date (не date_of_birth).
    search_fields = ['first_name', 'last_name', 'middle_name', 'phone', 'email']
    filterset_class = PatientFilter
    ordering_fields = ['last_name', 'first_name', 'birth_date', 'last_visit_date',
                       'total_revenue_kopecks', 'created_at']

    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Экспорт пациентов в CSV. Учитывает активные фильтры списка
        (?search=, ?status=, ?source_code= и т.д.) — экспортируется то,
        что видно в таблице. Пагинация игнорируется (экспорт всей выборки).
        """
        qs = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="patients.csv"'
        # BOM — чтобы Excel корректно открыл кириллицу.
        response.write('﻿')

        writer = csv.writer(response)
        writer.writerow(CSV_FIELDS)
        for p in qs:
            writer.writerow([
                p.last_name,
                p.first_name,
                p.middle_name,
                p.phone,
                p.email,
                p.birth_date.isoformat() if p.birth_date else "",
                p.gender,
                p.address,
                p.status,
                p.notes,
            ])
        return response

    @action(
        detail=False,
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='import',
    )
    def import_csv(self, request):
        """
        Импорт пациентов из CSV-файла (поле формы `file`).
        Заголовок должен содержать как минимум last_name, first_name, phone.
        Возвращает {created, skipped, errors}.
        """
        upload = request.FILES.get('file')
        if not upload:
            return Response(
                {"detail": "Не передан файл (поле `file`)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            raw = upload.read().decode('utf-8-sig')
        except UnicodeDecodeError:
            return Response(
                {"detail": "Не удалось прочитать файл. Ожидается CSV в кодировке UTF-8."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reader = csv.DictReader(io.StringIO(raw))
        valid_statuses = {c[0] for c in Patient.STATUS_CHOICES}

        created = 0
        skipped = 0
        errors = []

        for i, row in enumerate(reader, start=2):  # строка 1 — заголовок
            last_name = (row.get('last_name') or '').strip()
            first_name = (row.get('first_name') or '').strip()
            phone = (row.get('phone') or '').strip()

            if not (last_name and first_name and phone):
                skipped += 1
                errors.append(f"Строка {i}: пропущена — нужны last_name, first_name, phone.")
                continue

            # Пропускаем дубль по телефону.
            if Patient.objects.filter(phone=phone).exists():
                skipped += 1
                continue

            row_status = (row.get('status') or 'NEW').strip().upper()
            if row_status not in valid_statuses:
                row_status = 'NEW'

            birth_date = (row.get('birth_date') or '').strip() or None

            try:
                Patient.objects.create(
                    last_name=last_name,
                    first_name=first_name,
                    middle_name=(row.get('middle_name') or '').strip(),
                    phone=phone,
                    email=(row.get('email') or '').strip(),
                    birth_date=birth_date,
                    gender=(row.get('gender') or '').strip(),
                    address=(row.get('address') or '').strip(),
                    status=row_status,
                    notes=(row.get('notes') or '').strip(),
                )
                created += 1
            except Exception as exc:  # noqa: BLE001
                skipped += 1
                errors.append(f"Строка {i}: ошибка — {exc}")

        return Response(
            {"created": created, "skipped": skipped, "errors": errors[:20]},
            status=status.HTTP_200_OK,
        )


    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Полная история пациента для карточки: таймлайн, визиты, звонки,
        сообщения и заявки. Возвращает структуру со списками."""
        from appointments.models import Appointment
        from leads.models import Lead
        from communications.models import Message, CallLog
        from appointments.serializers import AppointmentSerializer

        patient = self.get_object()

        timeline = [
            {
                'id': e.id,
                'type': e.type,
                'payload': e.payload,
                'created_at': e.created_at,
            }
            for e in patient.timeline_events.all().order_by('-created_at')[:100]
        ]

        appointments = AppointmentSerializer(
            patient.appointments.select_related('doctor', 'service').order_by('-date', '-start_time'),
            many=True,
        ).data

        calls = [
            {
                'id': str(c.id),
                'direction': c.direction,
                'duration_sec': c.duration_sec,
                'result': c.result,
                'transcript': c.transcript,
                'started_at': c.started_at,
            }
            for c in patient.call_logs.all().order_by('-started_at')[:100]
        ]

        messages = [
            {
                'id': str(m.id),
                'direction': m.direction,
                'channel': m.channel.code if m.channel else None,
                'subject': m.subject,
                'body': m.body,
                'status': m.status,
                'sent_at': m.sent_at,
                'created_at': m.created_at,
            }
            for m in patient.messages.select_related('channel').order_by('-created_at')[:100]
        ]

        leads = [
            {
                'id': str(l.id),
                'channel': l.channel,
                'status': l.status,
                'estimated_value_kopecks': l.estimated_value_kopecks,
                'created_at': l.created_at,
            }
            for l in patient.origin_leads.all().order_by('-created_at')[:100]
        ]

        return Response({
            'timeline': timeline,
            'appointments': appointments,
            'calls': calls,
            'messages': messages,
            'leads': leads,
        })


class PatientSourceViewSet(viewsets.ModelViewSet):
    """Справочник источников пациентов (для фильтров и формы)."""
    queryset = PatientSource.objects.all().order_by('title')
    serializer_class = PatientSourceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class PatientTagViewSet(viewsets.ModelViewSet):
    """Справочник тегов пациентов (для фильтров и формы)."""
    queryset = PatientTag.objects.all().order_by('label')
    serializer_class = PatientTagSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
