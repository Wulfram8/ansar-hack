from datetime import date, timedelta

from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import AppointmentDailyAgg, PatientFlowAgg, RevenueAgg
from .serializers import DashboardSerializer

MONTHS_RU = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
]

# Цвета сегментов «Источники пациентов» — соответствуют дизайну (Pencil cIZZl).
SOURCE_COLORS = {
    "Сайт": "#2563eb",
    "Instagram": "#a855f7",
    "Рекомендации": "#22c55e",
    "Яндекс.Директ": "#eab308",
    "Другое": "#94a3b8",
}

# Специальности врачей для таблицы загруженности (по имени врача из агрегатов).
DOCTOR_SPECIALTY = {
    "Соколов А. А.": "Терапевт",
    "Михайлова Е. В.": "Стоматолог",
    "Лебедев А. Н.": "Кардиолог",
    "Орлова М. С.": "Невролог",
    "Зайцева О. П.": "Дерматолог",
}


def _delta(current, previous):
    """Процентное изменение current относительно previous, округлённое до 0.1."""
    if not previous:
        return 0.0
    return round((current - previous) / previous * 100, 1)


def _fmt_rub(kopecks):
    """Копейки → строка вида «₽ 3 482 600» (неразрывные пробелы как разделители)."""
    rub = int(round(kopecks / 100))
    return "₽ " + f"{rub:,}".replace(",", " ")


class DashboardView(APIView):
    """
    Сводный дашборд клиники: KPI, выручка по месяцам, источники пациентов,
    загруженность врачей и топ услуг. Данные агрегируются из таблиц analytics
    (наполняются командой `python manage.py seed_analytics`).
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=DashboardSerializer)
    def get(self, request):
        today = date.today()
        cur_start = today - timedelta(days=30)
        prev_start = today - timedelta(days=60)

        rev_q = RevenueAgg.objects.all()
        flow_q = PatientFlowAgg.objects.all()
        appt_q = AppointmentDailyAgg.objects.all()

        # ---- KPI: текущий период vs предыдущий ----
        rev_cur = rev_q.filter(date__gte=cur_start).aggregate(s=Sum("revenue_kopecks"))["s"] or 0
        rev_prev = rev_q.filter(date__gte=prev_start, date__lt=cur_start).aggregate(s=Sum("revenue_kopecks"))["s"] or 0

        new_cur = flow_q.filter(date__gte=cur_start).aggregate(s=Sum("new_patients"))["s"] or 0
        new_prev = flow_q.filter(date__gte=prev_start, date__lt=cur_start).aggregate(s=Sum("new_patients"))["s"] or 0

        appt_cur = appt_q.filter(date__gte=cur_start).aggregate(
            total=Sum("total_appointments"), completed=Sum("completed_appointments")
        )
        appt_prev = appt_q.filter(date__gte=prev_start, date__lt=cur_start).aggregate(
            total=Sum("total_appointments"), completed=Sum("completed_appointments")
        )

        total_cur = appt_cur["total"] or 0
        total_prev = appt_prev["total"] or 0
        conv_cur = round((appt_cur["completed"] or 0) / total_cur * 100, 1) if total_cur else 0.0
        conv_prev = round((appt_prev["completed"] or 0) / total_prev * 100, 1) if total_prev else 0.0

        avg_check_cur = int(rev_cur / (appt_cur["completed"] or 1)) if (appt_cur["completed"] or 0) else 0
        avg_check_prev = int(rev_prev / (appt_prev["completed"] or 1)) if (appt_prev["completed"] or 0) else 0

        def kpi(key, label, value, current, previous, fmt_pct=False):
            d = _delta(current, previous)
            return {
                "key": key,
                "label": label,
                "value": value,
                "delta": abs(d),
                "delta_direction": "up" if d >= 0 else "down",
            }

        kpis = [
            kpi("new_patients", "Новых пациентов", f"{new_cur}", new_cur, new_prev),
            kpi("revenue", "Выручка", _fmt_rub(rev_cur), rev_cur, rev_prev),
            kpi("conversion", "Конверсия лидов", f"{conv_cur}%", conv_cur, conv_prev),
            kpi("avg_check", "Средний чек", _fmt_rub(avg_check_cur), avg_check_cur, avg_check_prev),
        ]

        # ---- Выручка по месяцам (факт из агрегатов, план = факт * 1.1) ----
        revenue_by_month = []
        for i in range(11, -1, -1):
            m = (today.month - 1 - i) % 12
            year = today.year if (today.month - 1 - i) >= 0 else today.year - 1
            fact_k = rev_q.filter(date__year=year, date__month=m + 1).aggregate(s=Sum("revenue_kopecks"))["s"] or 0
            fact_rub = int(fact_k / 100)
            revenue_by_month.append({
                "month": MONTHS_RU[m],
                "plan": int(fact_rub * 1.1),
                "fact": fact_rub,
            })

        # ---- Источники пациентов (пончик) ----
        src_rows = (
            flow_q.values("source")
            .annotate(total=Sum("new_patients"))
            .order_by("-total")
        )
        sources_total = sum(r["total"] or 0 for r in src_rows) or 0
        patient_sources = []
        for r in src_rows:
            value = r["total"] or 0
            patient_sources.append({
                "label": r["source"],
                "value": value,
                "percent": round(value / sources_total * 100) if sources_total else 0,
                "color": SOURCE_COLORS.get(r["source"], "#94a3b8"),
            })

        # ---- Загруженность врачей ----
        doc_appt = (
            appt_q.values("doctor")
            .annotate(appointments=Sum("total_appointments"))
        )
        doc_rev = {
            r["doctor"]: r["s"] or 0
            for r in rev_q.values("doctor").annotate(s=Sum("revenue_kopecks"))
        }
        doctor_load = sorted(
            [
                {
                    "name": r["doctor"],
                    "specialty": DOCTOR_SPECIALTY.get(r["doctor"], "Врач"),
                    "appointments": r["appointments"] or 0,
                    "revenue_kopecks": doc_rev.get(r["doctor"], 0),
                }
                for r in doc_appt
            ],
            key=lambda x: x["revenue_kopecks"],
            reverse=True,
        )[:5]

        # ---- Топ услуг ----
        svc_rows = (
            rev_q.values("service")
            .annotate(revenue=Sum("revenue_kopecks"))
            .order_by("-revenue")[:5]
        )
        svc_counts = {
            r["service"]: r["s"] or 0
            for r in appt_q.values("service").annotate(s=Sum("completed_appointments"))
        }
        max_rev = max((r["revenue"] or 0 for r in svc_rows), default=0)
        top_services = [
            {
                "title": r["service"],
                "count": svc_counts.get(r["service"], 0),
                "revenue_kopecks": r["revenue"] or 0,
                "percent": round((r["revenue"] or 0) / max_rev * 100) if max_rev else 0,
            }
            for r in svc_rows
        ]

        payload = {
            "period_label": f"{cur_start.strftime('%d.%m')} — {today.strftime('%d.%m.%Y')}",
            "patient_sources_total": sources_total,
            "kpis": kpis,
            "revenue_by_month": revenue_by_month,
            "patient_sources": patient_sources,
            "doctor_load": doctor_load,
            "top_services": top_services,
        }
        return Response(DashboardSerializer(payload).data)
