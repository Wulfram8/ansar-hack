import random
from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Doctor
from appointments.models import Appointment, Service
from patients.models import Patient
from schedules.models import DoctorSchedule, ScheduleException

User = get_user_model()

# (Фамилия, Имя, Отчество, специальность, цвет)
DOCTORS = [
    ("Соколов", "Андрей", "Викторович", "Кардиолог", "#1e40af"),
    ("Морозова", "Елена", "Павловна", "Терапевт", "#a855f7"),
    ("Кузнецов", "Игорь", "Алексеевич", "УЗИ-диагност", "#16a34a"),
    ("Соколова", "Мария", "Владимировна", "Гинеколог", "#ec4899"),
    ("Иванов", "Павел", "Сергеевич", "Невролог", "#ea580c"),
    ("Петров", "Кирилл", "Андреевич", "Стоматолог", "#0891b2"),
]

START_HOURS = [8, 9, 10, 11, 12, 14, 15, 16, 17]


class Command(BaseCommand):
    help = "Наполняет расписание врачей: доктора, графики, записи недели и отпуска."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true",
                            help="Удалить врачей/записи расписания перед посевом.")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(21)
        today = date.today()
        monday = today - timedelta(days=today.weekday())

        if options["flush"]:
            self.stdout.write("Очищаю записи расписания...")
            ScheduleException.objects.all().delete()
            DoctorSchedule.objects.all().delete()

        services = list(Service.objects.all())
        if not services:
            self.stdout.write(self.style.WARNING(
                "Нет услуг — сначала запустите seed_leads/seed_analytics. Продолжаю без услуг."
            ))
        patients = list(Patient.objects.all()[:80])

        doctors = []
        for i, (last, first, middle, spec, color) in enumerate(DOCTORS):
            username = f"doctor{i+1}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={"first_name": first, "last_name": last, "email": f"{username}@clinic.local"},
            )
            changed = False
            for attr, val in (("first_name", first), ("last_name", last)):
                if getattr(user, attr) != val:
                    setattr(user, attr, val); changed = True
            if hasattr(user, "middle_name") and getattr(user, "middle_name", "") != middle:
                user.middle_name = middle; changed = True
            if changed:
                user.save()

            doc, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={"specialty": spec, "cabinet": str(101 + i), "color_hex": color},
            )
            if doc.specialty != spec or doc.color_hex != color:
                doc.specialty, doc.color_hex = spec, color
                doc.save(update_fields=["specialty", "color_hex"])
            doctors.append(doc)

            # График ПН–ПТ 08:00–18:00.
            for wd in range(5):
                DoctorSchedule.objects.get_or_create(
                    doctor=doc, weekday=wd,
                    defaults={"start_time": time(8, 0), "end_time": time(18, 0)},
                )

        # Записи на текущую неделю.
        created_appts = 0
        if patients:
            Appointment.objects.filter(date__range=(monday, monday + timedelta(days=6))).delete()
            for doc in doctors:
                for offset in range(5):  # ПН–ПТ
                    day = monday + timedelta(days=offset)
                    n = rng.randint(2, 5)
                    used = set()
                    for _ in range(n):
                        h = rng.choice(START_HOURS)
                        if h in used:
                            continue
                        used.add(h)
                        dur = rng.choice([30, 60])
                        end_h = h + (1 if dur == 60 else 0)
                        end_m = 0 if dur == 60 else 30
                        Appointment.objects.create(
                            patient=rng.choice(patients),
                            doctor=doc.user,
                            service=rng.choice(services) if services else None,
                            date=day,
                            start_time=time(h, 0),
                            end_time=time(end_h, end_m),
                            status=rng.choice(["CONFIRMED", "CONFIRMED", "CREATED", "COMPLETED"]),
                            cabinet=doc.cabinet,
                        )
                        created_appts += 1

        # Отпуска / выходные (ближайшие 30 дней).
        ScheduleException.objects.filter(date__gte=today).delete()
        exc_plan = [
            (doctors[3], today + timedelta(days=2), "VACATION"),
            (doctors[1], today + timedelta(days=16), "VACATION"),
            (doctors[2], today + timedelta(days=3), "SICK"),
            (doctors[4], today + timedelta(days=7), "BLOCKED"),
        ]
        for doc, d, kind in exc_plan:
            ScheduleException.objects.create(doctor=doc, date=d, type=kind, reason="Авто-сид")

        self.stdout.write(self.style.SUCCESS(
            f"Готово: {len(doctors)} врачей, {created_appts} записей недели, {len(exc_plan)} исключений."
        ))
