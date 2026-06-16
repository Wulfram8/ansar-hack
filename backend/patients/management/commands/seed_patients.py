import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from patients.models import Patient, PatientSource, PatientTag

# Источники пациентов: код → отображаемое имя (соответствуют фильтру дизайна).
SOURCES = [
    ("site", "Сайт"),
    ("instagram", "Instagram"),
    ("recommendation", "Рекомендация"),
    ("yandex", "Яндекс.Директ"),
    ("google", "Google"),
    ("vk_ads", "Реклама ВК"),
    ("telegram", "Telegram"),
    ("cold_call", "Холодный звонок"),
]

# Теги: подпись → цвет.
TAGS = [
    ("VIP", "#eab308"),
    ("Стоматология", "#2563eb"),
    ("Терапия", "#22c55e"),
    ("Беременность", "#ec4899"),
    ("Кардио", "#ef4444"),
    ("Косметология", "#a855f7"),
    ("Педиатрия", "#06b6d4"),
    ("Дети", "#f97316"),
    ("Спорт-медицина", "#14b8a6"),
    ("Первичный", "#94a3b8"),
]

STATUSES = ["NEW", "ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "ARCHIVED"]

LAST_NAMES_M = ["Иванов", "Петров", "Соколов", "Кузнецов", "Морозов", "Васильев",
                "Новиков", "Фёдоров", "Михайлов", "Романов", "Лебедев", "Козлов",
                "Волков", "Зайцев", "Павлов", "Семёнов", "Голубев", "Виноградов"]
FIRST_NAMES_M = ["Дмитрий", "Алексей", "Игорь", "Сергей", "Артём", "Андрей",
                 "Михаил", "Николай", "Олег", "Павел", "Роман", "Владимир"]
MIDDLE_M = ["Иванович", "Викторович", "Алексеевич", "Михайлович", "Олегович",
            "Сергеевич", "Дмитриевич", "Андреевич", "Николаевич", "Павлович"]

LAST_NAMES_F = ["Иванова", "Петрова", "Соколова", "Кузнецова", "Морозова", "Васильева",
                "Новикова", "Фёдорова", "Михайлова", "Романова", "Лебедева", "Козлова",
                "Волкова", "Зайцева", "Павлова", "Семёнова", "Голубева", "Виноградова"]
FIRST_NAMES_F = ["Анна", "Мария", "Екатерина", "Юлия", "Ольга", "Елена",
                 "Татьяна", "Наталья", "Ирина", "Светлана", "Дарья", "Алина"]
MIDDLE_F = ["Сергеевна", "Александровна", "Павловна", "Дмитриевна", "Андреевна",
            "Викторовна", "Ивановна", "Николаевна", "Олеговна", "Михайловна"]

EMAIL_DOMAINS = ["mail.ru", "gmail.com", "yandex.ru", "list.ru", "inbox.ru"]


class Command(BaseCommand):
    help = "Наполняет базу пациентов моковыми данными (источники, теги, ~N пациентов)."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=120,
                            help="Сколько пациентов создать (по умолчанию 120).")
        parser.add_argument("--flush", action="store_true",
                            help="Удалить существующих пациентов перед посевом.")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(7)
        today = date.today()

        if options["flush"]:
            self.stdout.write("Удаляю существующих пациентов...")
            Patient.objects.all().delete()

        # Источники и теги (идемпотентно).
        sources = []
        for code, title in SOURCES:
            src, _ = PatientSource.objects.get_or_create(code=code, defaults={"title": title})
            if src.title != title:
                src.title = title
                src.save(update_fields=["title"])
            sources.append(src)

        tags = []
        for label, color in TAGS:
            tag, _ = PatientTag.objects.get_or_create(label=label, defaults={"color": color})
            tags.append(tag)

        count = options["count"]
        self.stdout.write(f"Создаю {count} пациентов...")
        created = 0
        for i in range(count):
            female = rng.random() < 0.58
            if female:
                last = rng.choice(LAST_NAMES_F)
                first = rng.choice(FIRST_NAMES_F)
                middle = rng.choice(MIDDLE_F)
                gender = "female"
            else:
                last = rng.choice(LAST_NAMES_M)
                first = rng.choice(FIRST_NAMES_M)
                middle = rng.choice(MIDDLE_M)
                gender = "male"

            status = rng.choice(STATUSES)
            birth = date(rng.randint(1955, 2007), rng.randint(1, 12), rng.randint(1, 28))

            translit = "".join(rng.choice("abcdefghijklmnop") for _ in range(6))
            email = f"{translit}@{rng.choice(EMAIL_DOMAINS)}" if rng.random() < 0.9 else ""

            phone = "+7 (9{:02d}) {:03d}-{:02d}-{:02d}".format(
                rng.randint(0, 99), rng.randint(100, 999),
                rng.randint(10, 99), rng.randint(10, 99),
            )

            has_visit = status not in ("NEW",) and rng.random() < 0.85
            last_visit = today - timedelta(days=rng.randint(1, 300)) if has_visit else None

            visits = rng.randint(0, 24) if status != "NEW" else 0
            avg_check = rng.randint(150_000, 900_000)
            revenue = visits * avg_check

            patient = Patient.objects.create(
                first_name=first,
                last_name=last,
                middle_name=middle,
                birth_date=birth,
                gender=gender,
                phone=phone,
                email=email,
                source=rng.choice(sources),
                status=status,
                last_visit_date=last_visit,
                next_visit_date=(today + timedelta(days=rng.randint(3, 40))) if rng.random() < 0.4 else None,
                notes="",
                total_revenue_kopecks=revenue,
                visits_count=visits,
                average_check_kopecks=avg_check if visits else 0,
                lifetime_value_kopecks=int(revenue * rng.uniform(1.0, 1.4)),
            )

            # 0–3 тега.
            patient.tags.set(rng.sample(tags, rng.randint(0, 3)))
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Готово: {len(sources)} источников, {len(tags)} тегов, {created} пациентов."
        ))
