import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from analytics.models import AppointmentDailyAgg, PatientFlowAgg, RevenueAgg

CLINIC = "Главная клиника"

DOCTORS = [
    "Соколов А. А.",
    "Михайлова Е. В.",
    "Лебедев А. Н.",
    "Орлова М. С.",
    "Зайцева О. П.",
]

# Услуга → (доля приёмов, средняя цена в копейках)
SERVICES = {
    "Терапевтический приём": (0.30, 250_000),
    "УЗИ комплексное": (0.18, 420_000),
    "Лечение кариеса": (0.22, 380_000),
    "Консультация кардиолога": (0.16, 300_000),
    "Косметология": (0.14, 550_000),
}

# Источник пациента → вес (для пончика «Источники пациентов»)
SOURCES = {
    "Сайт": 0.26,
    "Instagram": 0.23,
    "Рекомендации": 0.19,
    "Яндекс.Директ": 0.17,
    "Другое": 0.15,
}


class Command(BaseCommand):
    help = "Наполняет таблицы analytics моковыми данными для дашборда (за ~13 месяцев)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days", type=int, default=400,
            help="За сколько последних дней генерировать данные (по умолчанию 400).",
        )

    def handle(self, *args, **options):
        rng = random.Random(42)
        days = options["days"]
        today = date.today()

        self.stdout.write("Очищаю старые агрегаты analytics...")
        RevenueAgg.objects.all().delete()
        PatientFlowAgg.objects.all().delete()
        AppointmentDailyAgg.objects.all().delete()

        revenue_rows = []
        flow_rows = []
        appt_rows = []

        for offset in range(days):
            day = today - timedelta(days=offset)
            # Сезонный множитель + лёгкий рост к настоящему времени.
            seasonal = 1.0 + 0.18 * (1 - offset / days)
            weekday_factor = 0.55 if day.weekday() >= 5 else 1.0
            base_appts = rng.randint(14, 22)
            day_appts = max(1, int(base_appts * seasonal * weekday_factor))

            # Записи по врачам и услугам.
            for doctor in DOCTORS:
                d_appts = max(0, int(day_appts / len(DOCTORS)) + rng.randint(-1, 2))
                if d_appts == 0:
                    continue
                for service, (share, price) in SERVICES.items():
                    s_total = int(round(d_appts * share))
                    if s_total == 0:
                        continue
                    completed = int(round(s_total * rng.uniform(0.78, 0.92)))
                    cancelled = int(round((s_total - completed) * rng.uniform(0.4, 0.7)))
                    no_show = max(0, s_total - completed - cancelled)
                    appt_rows.append(AppointmentDailyAgg(
                        date=day, clinic=CLINIC, doctor=doctor, service=service,
                        total_appointments=s_total,
                        completed_appointments=completed,
                        cancelled_appointments=cancelled,
                        no_show_appointments=no_show,
                    ))
                    revenue_rows.append(RevenueAgg(
                        date=day, clinic=CLINIC, doctor=doctor, service=service,
                        revenue_kopecks=int(completed * price * rng.uniform(0.92, 1.08)),
                    ))

            # Поток пациентов по источникам.
            new_total = max(1, int(rng.randint(6, 11) * seasonal * weekday_factor))
            for source, weight in SOURCES.items():
                n = max(0, int(round(new_total * weight)) + rng.randint(-1, 1))
                flow_rows.append(PatientFlowAgg(
                    date=day, clinic=CLINIC, source=source,
                    new_patients=n,
                    active_patients=n + rng.randint(2, 6),
                ))

        self.stdout.write("Сохраняю агрегаты...")
        AppointmentDailyAgg.objects.bulk_create(appt_rows, batch_size=2000)
        RevenueAgg.objects.bulk_create(revenue_rows, batch_size=2000)
        PatientFlowAgg.objects.bulk_create(flow_rows, batch_size=2000)

        self.stdout.write(self.style.SUCCESS(
            f"Готово: {len(appt_rows)} записей appointments, "
            f"{len(revenue_rows)} revenue, {len(flow_rows)} patient-flow."
        ))
