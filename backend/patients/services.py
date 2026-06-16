"""Сервисный слой для работы с пациентами по номеру телефона.

Телефон — единый ключ, который связывает три сущности:
заявку с сайта (Lead), профиль пациента (Patient) и вход по OTP (User).
Здесь живёт логика поиска/создания пациента по номеру и привязки
к нему открытых заявок.
"""
from core.phone import normalize_phone, phone_core
from .models import Patient, PatientTimelineEvent


def find_patient_by_phone(phone):
    """Найти пациента по номеру телефона в любом формате хранения.

    Сначала пытается точное совпадение по канонизированному номеру,
    затем сравнивает по последним цифрам (на случай старых записей,
    сохранённых в произвольном формате). Возвращает Patient или None.
    """
    norm = normalize_phone(phone)
    if not norm:
        return None

    exact = Patient.objects.filter(phone=norm).order_by("created_at").first()
    if exact:
        return exact

    core = phone_core(norm)
    if not core:
        return None
    # узкий отбор кандидатов по последним 7 цифрам, затем точное сравнение
    for cand in Patient.objects.filter(phone__contains=core[-7:]).order_by("created_at"):
        if normalize_phone(cand.phone) == norm:
            return cand
    return None


def find_or_create_patient_by_phone(phone, defaults=None):
    """Вернуть существующего пациента по телефону либо создать нового.

    Возвращает кортеж (patient, created).
    """
    norm = normalize_phone(phone)
    patient = find_patient_by_phone(norm or phone)
    if patient:
        return patient, False

    data = {"first_name": "", "last_name": ""}
    if defaults:
        data.update(defaults)
    # phone сохраняем в каноническом виде (на всякий случай — модель тоже нормализует)
    data["phone"] = norm or (phone or "")
    patient = Patient.objects.create(**data)
    return patient, True


def link_open_leads_to_patient(patient, actor=None):
    """Привязать к пациенту все его незакрытые заявки с тем же телефоном.

    Проставляет Lead.converted_patient, пишет LeadActivity и событие
    в таймлайн пациента. Не трогает заявки со статусом LOST и уже
    привязанные. Возвращает список связанных заявок.
    """
    # импорт внутри функции — чтобы избежать циклической зависимости приложений
    from leads.models import Lead, LeadActivity

    norm = normalize_phone(patient.phone)
    if not norm:
        return []
    core = phone_core(norm)

    candidates = (
        Lead.objects
        .filter(converted_patient__isnull=True, phone__contains=core[-7:])
        .exclude(status="LOST")
    )

    linked = []
    for lead in candidates:
        if normalize_phone(lead.phone) != norm:
            continue

        lead.converted_patient = patient
        lead.save(update_fields=["converted_patient", "updated_at"])

        LeadActivity.objects.create(
            lead=lead,
            kind="ASSIGN",
            payload={
                "reason": "matched_patient_by_phone",
                "patient_id": str(patient.id),
            },
            actor=actor,
        )
        PatientTimelineEvent.objects.create(
            patient=patient,
            type="LEAD",
            payload={
                "lead_id": str(lead.id),
                "channel": lead.channel,
                "status": lead.status,
                "matched_by": "phone",
            },
            actor=actor,
        )
        linked.append(lead)

    return linked
