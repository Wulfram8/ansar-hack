

================================================================
АРХИТЕКТУРА
================================================================
Layered architecture с разделением:
apps/
accounts/ — User, Role, Permission, JWT auth
patients/ — Patient, Tag, Source, Timeline
appointments/ — Appointment, статусы, проверка пересечений
schedules/ — DoctorSchedule, WorkingHours, TimeOff
leads/ — Lead, Pipeline, Stage, история коммуникаций
communications/ — Call, SMS, Email, WhatsApp, Telegram сообщения
notifications/ — NotificationTemplate, AutomationRule, SendJob
marketing/ — Segment, Campaign, Delivery
analytics/ — агрегаты, дашборды, отчёты
ai_assistant/ — Conversation, Message, Tool (function-calling)
core/ — общие helpers: BaseModel, pagination, permissions, audit
integrations/ — провайдеры (SMS, email, мессенджеры, телефония, AI)

Каждое приложение:
models.py · selectors.py (чтение) · services.py (запись/логика) · tasks.py (Celery)
serializers.py · views.py · urls.py · permissions.py · filters.py · tests/

Правила:

- ViewSet'ы тонкие: только сериализация + вызов selectors/services.
- Бизнес-логика — в services (transactional, с domain events).
- Никаких .save() в views.
- Все денежные суммы — Decimal с quantize до копеек, поле amount_kopecks (int).
- Все datetime — timezone-aware (UTC в БД, отдача с TZ клиники).
- BaseModel: id (UUIDv7), created_at, updated_at, soft-delete (deleted_at), created_by, updated_by.

================================================================
МОДЕЛЬ ДАННЫХ (минимально)
================================================================

Accounts:
User(email unique, phone, first_name, last_name, middle_name, role FK, is_active, password_hash, mfa_secret)
Role(code in {ADMIN, DOCTOR, MANAGER}, name, permissions M2M)
Doctor(user OneToOne, specialty, cabinet, color_hex, hourly_rate, license_number)
Clinic(name, address, timezone, working_hours_default)
AuditLog(actor, action, target_type, target_id, diff JSONB, created_at)

Patients:
Patient(first_name, last_name, middle_name, birth_date, gender, phone unique-per-clinic,
email, address, source FK, status in {NEW, ACTIVE, INACTIVE, ARCHIVED, BLOCKED},
tags M2M, last_visit_date, next_visit_date, notes, total_revenue_kopecks,
visits_count, average_check_kopecks, lifetime_value_kopecks)
PatientSource(code, title) — Сайт, Телефон, WhatsApp, Telegram, Email, Instagram, Рекомендация
PatientTag(label, color)
PatientTimelineEvent(patient FK, type in {CREATED, CALL, LEAD, APPOINTMENT_BOOKED,
APPOINTMENT_COMPLETED, NOTIFICATION_SENT, CAMPAIGN_RECEIVED, NOTE},
payload JSONB, actor FK nullable, created_at) — создаётся доменными событиями.

Appointments:
Service(code, title, category, duration_min, price_kopecks, color_hex)
Appointment(patient FK, doctor FK, service FK, cabinet, date, start_time, end_time,
status in {CREATED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW},
comment, source_lead FK nullable, recommended_followup_at,
cancel_reason, cancelled_at)
Recommendation(appointment FK, text, files JSONB, created_at)
FollowUp(patient FK, due_date, interval_label, status in {OPEN, NOTIFIED, BOOKED, CLOSED},
created_by, source_appointment FK)

Schedules:
DoctorSchedule(doctor FK, weekday 0..6, start_time, end_time, break_start, break_end, active_from, active_to)
ScheduleException(doctor FK, date, type in {DAY_OFF, VACATION, SICK, BLOCKED},
start_time nullable, end_time nullable, reason)
Constraint: запись возможна только внутри активного расписания и вне исключений.

Leads:
Lead(first_name, last_name, phone, email, source FK, channel in {SITE, CALL, WHATSAPP,
TELEGRAM, EMAIL, INSTAGRAM, OTHER}, status in {NEW, CONTACTED, INTERESTED,
APPOINTMENT_BOOKED, LOST}, assigned_admin FK, estimated_value_kopecks,
service_interest FK nullable, utm JSONB, lost_reason, due_at, notes,
converted_patient FK nullable, converted_appointment FK nullable)
LeadActivity(lead FK, kind in {NOTE, CALL, MESSAGE, STATUS_CHANGE, ASSIGN, REMINDER},
payload JSONB, actor FK, created_at)

Communications:
Channel(code in {CALL, SMS, EMAIL, WHATSAPP, TELEGRAM})
Message(patient FK nullable, lead FK nullable, channel, direction in {IN, OUT},
actor FK nullable, subject, body, attachments JSONB, status in {QUEUED, SENT,
DELIVERED, READ, FAILED}, provider_id, sent_at, result JSONB)
CallLog(patient/lead FK, direction, duration_sec, recording_url, transcript,
result in {ANSWERED, MISSED, BUSY, REJECTED}, actor FK, started_at)

Notifications (автоматические):
NotificationTemplate(code unique, title, body, channels M2M, variables JSONB,
is_active)
AutomationRule(template FK, trigger_kind in {BEFORE_APPOINTMENT, AFTER_APPOINTMENT,
AFTER_CANCEL, FOLLOWUP_DUE, CUSTOM}, offset_minutes int, conditions JSONB,
is_active)
ScheduledNotification(rule FK, patient FK, appointment FK nullable, send_at,
channel, status in {PENDING, SENT, FAILED, CANCELLED}, payload JSONB,
attempts, last_error)

Marketing:
Segment(title, description, query_kind in {STATIC, DYNAMIC, AI_GENERATED},
ast JSONB — условия фильтрации, refresh_interval_min, last_built_at,
patient_count_cache)
Campaign(title, segment FK, channels M2M, message_template_id, status in {DRAFT,
SCHEDULED, RUNNING, COMPLETED, PAUSED, CANCELLED}, scheduled_at,
started_at, completed_at, sent_count, open_count, click_count,
booking_count, revenue_kopecks)
CampaignDelivery(campaign FK, patient FK, channel, status, sent_at, opened_at,
clicked_at, conversion_appointment FK nullable, provider_id)

Analytics (агрегаты, материализованные view'хи):
Партиционирование AppointmentDailyAgg/PatientFlowAgg/RevenueAgg по месяцам.
Сохраняем заранее посчитанные KPI по (date, clinic, doctor, service, source).


================================================================
БИЗНЕС-ПРАВИЛА (критично)
================================================================

- Все изменения статуса Appointment эмитят domain events
  (signals или EventBus) → создают PatientTimelineEvent, триггерят NotificationRule.
- FollowUp создаётся: вручную врачом/админом или автоматически после COMPLETED, если
  у Service настроен recommended_followup_interval.
- Lead конвертируется в Patient + Appointment через сервис LeadConversionService:
  атомарно (transaction.atomic), с переносом истории коммуникаций.
- Все рассылки идут через NotificationDispatcher с rate-limiting (Redis token bucket)
  и retry-policy (3 попытки, экспоненциальный backoff).

================================================================
REST API (DRF, префикс /api/v1/, OpenAPI обязателен)
================================================================
Принципы:

- Cursor-пагинация для списков > 500 записей; LimitOffset для остальных.
- Универсальные query-параметры: ?search=, ?ordering=, ?filter[...].
- Возврат полей через ?fields= (sparse fieldsets).
- 4xx ошибки в формате {detail, code, errors: {field: [...]}} (RFC 7807-совместимо).
- ETag/If-Match для конкурентного обновления критичных сущностей (Appointment).

Эндпоинты (минимум):
auth/ login, refresh, logout, me, password/reset
users/ CRUD + /me, /change-password
patients/ CRUD, /search, /import (CSV/XLSX, фоновая задача), /export,
/:id/timeline, /:id/appointments, /:id/communications,
/:id/archive, /:id/restore, /:id/merge (объединение дублей)
appointments/ CRUD, /:id/confirm, /:id/cancel, /:id/complete, /:id/no-show,
/:id/reschedule, /free-slots?doctor=&service=&date_from=&date_to=,
/calendar?view=day|week|month&doctor=&cabinet=
schedules/ CRUD расписаний и исключений, /:doctor/week, /workload
leads/ CRUD, /pipeline (Канбан-вид), /:id/move, /:id/assign,
/:id/convert, /:id/activities (POST), /reminders
communications/ CRUD, /:patient/thread, /send (через провайдер)
notifications/templates/ CRUD
notifications/rules/ CRUD, /:id/test
notifications/scheduled/ list, /:id/cancel
marketing/segments/ CRUD, /:id/preview, /:id/rebuild, /ai-generate (LLM)
marketing/campaigns/ CRUD, /:id/launch, /:id/pause, /:id/stats
analytics/dashboards/ /overview, /doctors, /marketing, /finance, /patients
analytics/reports/ произвольные срезы, /export
ai/conversations/ CRUD, /:id/messages (POST = новый запрос, SSE-стрим)
webhooks/ провайдеры (callbacks доставки, входящие сообщения)

================================================================
WEBSOCKETS (Channels)
================================================================
/ws/notifications/ — push новых уведомлений в шапку (badge + toast)
/ws/leads/ — обновление Канбан-доски в реальном времени
/ws/calendar/ — изменение записей в текущем календарном виде
Аутентификация — JWT в query или subprotocol; авторизация per room на основе роли.