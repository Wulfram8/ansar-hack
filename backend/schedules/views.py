from datetime import date, datetime, time, timedelta

from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter

from accounts.models import Doctor
from appointments.models import Appointment
from .models import ScheduleException
from .serializers import ScheduleBoardSerializer

WEEKDAYS_RU = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]
MONTHS_RU = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
]

# Рабочее окно дня для раскладки блоков.
DAY_START = time(8, 0)
DAY_END = time(20, 0)
DAY_MINUTES = (DAY_END.hour - DAY_START.hour) * 60

EXC_STYLE = {
    "VACATION": ("Отпуск", "#d97706", "#fef3c7"),
    "DAY_OFF": ("Выходной", "#64748b", "#f1f5f9"),
    "SICK": ("Больничный", "#dc2626", "#fee2e2"),
    "BLOCKED": ("Недоступен", "#1e40af", "#dbeafe"),
}


def _initials(first, last):
    return f"{(last or '')[:1]}{(first or '')[:1]}".upper() or "—"


def _pct(t: time) -> float:
    mins = (t.hour - DAY_START.hour) * 60 + t.minute
    return max(0.0, min(100.0, mins / DAY_MINUTES * 100))


def _parse_week(raw):
    if raw:
        try:
            d = datetime.strptime(raw, "%Y-%m-%d").date()
        except ValueError:
            d = date.today()
    else:
        d = date.today()
    return d - timedelta(days=d.weekday())  # понедельник недели


class ScheduleBoardView(APIView):
    """
    Доска расписания врачей на неделю: строки врачей с блоками записей по дням,
    загрузка, свободные окна и ближайшие отпуска. ?week=YYYY-MM-DD — любой день недели.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[OpenApiParameter("week", str, description="Любая дата недели (YYYY-MM-DD)")],
        responses=ScheduleBoardSerializer,
    )
    def get(self, request):
        today = date.today()
        week_start = _parse_week(request.query_params.get("week"))
        week_days = [week_start + timedelta(days=i) for i in range(7)]

        # Заголовки дней.
        day_headers = [
            {
                "weekday": WEEKDAYS_RU[i],
                "date_label": d.strftime("%d.%m"),
                "date": d,
                "is_today": d == today,
            }
            for i, d in enumerate(week_days)
        ]

        doctors = list(Doctor.objects.select_related("user").all().order_by("user__last_name"))

        # Записи недели по врачам (Appointment.doctor — это User).
        appts = (
            Appointment.objects
            .filter(date__range=(week_days[0], week_days[-1]))
            .exclude(status="CANCELLED")
            .select_related("patient", "service")
        )
        appts_by_user = {}
        for a in appts:
            appts_by_user.setdefault(a.doctor_id, []).append(a)

        # Исключения (отпуска/выходные) за неделю и ближайшие 30 дней.
        week_exc = ScheduleException.objects.filter(date__range=(week_days[0], week_days[-1]))
        exc_by_doc_date = {}
        for e in week_exc:
            exc_by_doc_date[(e.doctor_id, e.date)] = e

        doctor_rows = []
        load_bars = []
        free_by_day_count = {d: 0 for d in week_days}

        for doc in doctors:
            u = doc.user
            user_appts = appts_by_user.get(u.id, [])
            appts_by_date = {}
            for a in user_appts:
                appts_by_date.setdefault(a.date, []).append(a)

            days = []
            busy_minutes = 0
            for d in week_days:
                exc = exc_by_doc_date.get((doc.id, d))
                if exc:
                    label = EXC_STYLE.get(exc.type, ("Недоступен", "#64748b", "#f1f5f9"))[0]
                    days.append({"date": d, "is_off": True, "off_label": label, "blocks": []})
                    continue

                blocks = []
                for a in sorted(appts_by_date.get(d, []), key=lambda x: x.start_time):
                    left = _pct(a.start_time)
                    width = max(2.0, _pct(a.end_time) - left)
                    busy_minutes += (
                        (a.end_time.hour * 60 + a.end_time.minute)
                        - (a.start_time.hour * 60 + a.start_time.minute)
                    )
                    blocks.append({
                        "start": a.start_time.strftime("%H:%M"),
                        "end": a.end_time.strftime("%H:%M"),
                        "left_pct": round(left, 2),
                        "width_pct": round(width, 2),
                        "patient": (
                            f"{a.patient.last_name} {a.patient.first_name[:1]}." if a.patient else None
                        ),
                        "patient_id": str(a.patient_id) if a.patient_id else None,
                        "appointment_id": str(a.id),
                        "service": a.service.title if a.service else None,
                        "status": a.status,
                    })
                # Свободные окна дня: грубо — слоты по 30 мин минус занятые.
                free_slots = max(0, (DAY_MINUTES // 30) - len(appts_by_date.get(d, [])) * 1)
                if d.weekday() < 5:
                    free_by_day_count[d] += min(free_slots, 3)
                days.append({"date": d, "is_off": False, "off_label": None, "blocks": blocks})

            # Загрузка = занятые минуты / (рабочие дни * окно).
            work_days = sum(1 for x in days if not x["is_off"])
            capacity = max(1, work_days) * DAY_MINUTES
            load = int(round(busy_minutes / capacity * 100)) if capacity else 0
            load = min(100, load)

            doctor_rows.append({
                "id": str(doc.id),
                "user_id": str(u.id),
                "name": f"{u.last_name} {u.first_name[:1]}.{(u.middle_name[:1] + '.') if getattr(u, 'middle_name', '') else ''}".strip(),
                "initials": _initials(u.first_name, u.last_name),
                "specialty": doc.specialty or "Врач",
                "color": doc.color_hex or "#1e40af",
                "load_percent": load,
                "days": days,
            })
            load_bars.append({
                "initials": _initials(u.first_name, u.last_name),
                "percent": load,
                "color": doc.color_hex or "#1e40af",
            })

        free_by_day = [
            {"label": f"{WEEKDAYS_RU[i]} {d.strftime('%d.%m')}", "count": free_by_day_count[d]}
            for i, d in enumerate(week_days) if d.weekday() < 5
        ]
        free_total = sum(c["count"] for c in free_by_day)
        load_avg = round(sum(b["percent"] for b in load_bars) / len(load_bars), 1) if load_bars else 0.0

        # Ближайшие отпуска/выходные (30 дней).
        upcoming = (
            ScheduleException.objects
            .filter(date__gte=today, date__lte=today + timedelta(days=30))
            .select_related("doctor__user")
            .order_by("date")[:8]
        )
        time_off = []
        for e in upcoming:
            label, color, _bg = EXC_STYLE.get(e.type, ("Недоступен", "#64748b", "#f1f5f9"))
            du = e.doctor.user
            time_off.append({
                "name": f"{du.last_name} {du.first_name[:1]}.",
                "detail": f"{e.doctor.specialty} · {e.date.strftime('%d.%m')}",
                "kind": label,
                "color": color,
            })

        payload = {
            "week_label": f"{week_days[0].day}–{week_days[-1].day} {MONTHS_RU[week_days[-1].month - 1]} {week_days[-1].year}",
            "week_start": week_start,
            "day_headers": day_headers,
            "doctors": doctor_rows,
            "free_slots_total": free_total,
            "free_slots_delta": 12,
            "free_slots_by_day": free_by_day,
            "load_avg": load_avg,
            "load_bars": load_bars,
            "time_off": time_off,
        }
        return Response(ScheduleBoardSerializer(payload).data)


from rest_framework import viewsets
from .models import DoctorSchedule, ScheduleException
from .serializers import DoctorScheduleSerializer, ScheduleExceptionSerializer


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    """Рабочие смены врачей (постоянное недельное расписание)."""
    queryset = DoctorSchedule.objects.select_related('doctor__user').all().order_by('weekday', 'start_time')
    serializer_class = DoctorScheduleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ['doctor', 'weekday']


class ScheduleExceptionViewSet(viewsets.ModelViewSet):
    """Исключения: отпуска, больничные, выходные, блокировки."""
    queryset = ScheduleException.objects.select_related('doctor__user').all().order_by('-date')
    serializer_class = ScheduleExceptionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ['doctor', 'type']


import calendar as _calendar

MONTHS_NOM = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]


class MonthBoardView(APIView):
    """Календарь записей на месяц. ?date=YYYY-MM-DD (любой день месяца).
    Возвращает сетку 6×7 (с хвостами соседних месяцев)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        raw = request.query_params.get("date")
        try:
            base = datetime.strptime(raw, "%Y-%m-%d").date() if raw else date.today()
        except ValueError:
            base = date.today()
        today = date.today()
        first = base.replace(day=1)
        last = base.replace(day=_calendar.monthrange(base.year, base.month)[1])
        grid_start = first - timedelta(days=first.weekday())
        grid_end = last + timedelta(days=(6 - last.weekday()))

        # Цвета врачей по их user_id.
        doc_color = {
            d.user_id: (d.color_hex or "#1e40af")
            for d in Doctor.objects.all()
        }

        appts = (
            Appointment.objects
            .filter(date__range=(grid_start, grid_end))
            .exclude(status="CANCELLED")
            .select_related("patient", "doctor", "service")
            .order_by("date", "start_time")
        )
        by_date = {}
        for a in appts:
            u = a.doctor
            doctor_name = (" ".join(filter(None, [u.last_name, u.first_name])) or u.username) if u else "—"
            by_date.setdefault(a.date, []).append({
                "id": str(a.id),
                "time": a.start_time.strftime("%H:%M"),
                "patient": (f"{a.patient.last_name} {a.patient.first_name[:1]}." if a.patient else "—"),
                "patient_id": str(a.patient_id) if a.patient_id else None,
                "doctor": doctor_name,
                "service": a.service.title if a.service else None,
                "status": a.status,
                "color": doc_color.get(a.doctor_id, "#1e40af"),
            })

        days = []
        cur = grid_start
        while cur <= grid_end:
            days.append({
                "date": cur.isoformat(),
                "day": cur.day,
                "in_month": cur.month == base.month,
                "is_today": cur == today,
                "appointments": by_date.get(cur, []),
            })
            cur += timedelta(days=1)

        return Response({
            "month_label": f"{MONTHS_NOM[base.month - 1]} {base.year}",
            "month": base.month,
            "year": base.year,
            "days": days,
        })
