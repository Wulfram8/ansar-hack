import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from appointments.models import Service
from leads.models import Lead
from patients.models import PatientSource

User = get_user_model()

STATUSES = ["NEW", "CONTACTED", "INTERESTED", "APPOINTMENT_BOOKED", "LOST"]

# Распределение лидов по стадиям воронки (как на дизайне).
STATUS_WEIGHTS = {
    "NEW": 10,
    "CONTACTED": 9,
    "INTERESTED": 7,
    "APPOINTMENT_BOOKED": 6,
    "LOST": 5,
}

CHANNELS = ["SITE", "WHATSAPP", "INSTAGRAM", "TELEGRAM", "CALL", "EMAIL"]

# Услуги интереса: title → (категория, цена в копейках).
SERVICES = [
    ("Имплантация", "Стоматология", 8_500_000),
    ("Консультация терапевта", "Терапия", 250_000),
    ("УЗИ сердца", "Диагностика", 480_000),
    ("Чистка зубов", "Стоматология", 650_000),
    ("Косметология лица", "Косметология", 550_000),
    ("Приём кардиолога", "Кардиология", 300_000),
    ("Лечение кариеса", "Стоматология", 380_000),
    ("Массаж спины", "Реабилитация", 220_000),
]

FIRST_M = ["Игорь", "Виктор", "Дмитрий", "Алексей", "Сергей", "Андрей", "Павел", "Роман"]
LAST_M = ["Семёнов", "Орлов", "Кузнецов", "Морозов", "Волков", "Зайцев", "Лебедев"]
FIRST_F = ["Мария", "Лидия", "Анна", "Ольга", "Елена", "Дарья", "Юлия", "Ирина"]
LAST_F = ["Калинина", "Шевцова", "Соколова", "Морозова", "Орлова", "Кузнецова"]


class Command(BaseCommand):
    help = "Наполняет воронку лидов моковыми данными (услуги + ~N лидов по стадиям)."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=40,
                            help="Сколько лидов создать (по умолчанию 40).")
        parser.add_argument("--flush", action="store_true",
                            help="Удалить существующих лидов перед посевом.")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(11)
        now = timezone.now()

        if options["flush"]:
            self.stdout.write("Удаляю существующих лидов...")
            Lead.objects.all().delete()

        # Услуги (идемпотентно).
        services = []
        for i, (title, category, price) in enumerate(SERVICES):
            code = f"svc_{i:02d}"
            svc, _ = Service.objects.get_or_create(
                code=code,
                defaults={
                    "title": title,
                    "category": category,
                    "price_kopecks": price,
                    "duration_min": rng.choice([30, 45, 60]),
                    "color_hex": rng.choice(["#2563eb", "#22c55e", "#a855f7", "#ef4444", "#eab308"]),
                },
            )
            services.append(svc)

        sources = list(PatientSource.objects.all())
        admins = list(User.objects.all()[:5])

        # Раскладываем лидов по стадиям согласно весам.
        bag = []
        for st in STATUSES:
            bag += [st] * STATUS_WEIGHTS[st]

        count = options["count"]
        self.stdout.write(f"Создаю {count} лидов...")
        created = 0
        for _ in range(count):
            status = rng.choice(bag)
            female = rng.random() < 0.5
            first = rng.choice(FIRST_F if female else FIRST_M)
            last = rng.choice(LAST_F if female else LAST_M)
            svc = rng.choice(services)

            # «Горячий» лид — для свежих заявок с высоким чеком.
            hot = status in ("NEW", "CONTACTED") and rng.random() < 0.3
            created_at = now - timedelta(minutes=rng.randint(5, 60 * 24 * 20))

            lead = Lead.objects.create(
                first_name=first,
                last_name=last,
                phone="+7 (9{:02d}) {:03d}-{:02d}-{:02d}".format(
                    rng.randint(0, 99), rng.randint(100, 999),
                    rng.randint(10, 99), rng.randint(10, 99),
                ),
                email=f"{first.lower()}@example.com" if rng.random() < 0.5 else "",
                source=rng.choice(sources) if sources else None,
                channel=rng.choice(CHANNELS),
                status=status,
                assigned_admin=rng.choice(admins) if admins else None,
                estimated_value_kopecks=svc.price_kopecks + rng.randint(-50_000, 150_000),
                service_interest=svc,
                utm={"hot": True} if hot else {},
                due_at=(now + timedelta(days=rng.randint(1, 14))) if status != "LOST" and rng.random() < 0.5 else None,
                lost_reason=rng.choice(["Дорого", "Выбрал другую клинику", "Передумал"]) if status == "LOST" else "",
            )
            # created_at управляется auto_now_add — переопределяем напрямую.
            Lead.objects.filter(pk=lead.pk).update(created_at=created_at)
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Готово: {len(services)} услуг, {created} лидов."
        ))
