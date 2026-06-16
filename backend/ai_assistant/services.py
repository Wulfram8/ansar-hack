"""
Бизнес-логика AI-ассистента клиники.

LLM-провайдер не подключён в этой сборке, поэтому ответы формируются
детерминированным правиловым движком на основе домена CRM: загруженность
врачей, лиды, повторные визиты, маркетинговые рассылки. Это позволяет
экрану «AI Ассистент» (дизайн Pencil Awkkm) работать полностью офлайн.

Слой services по принятой архитектуре: вся бизнес-логика здесь,
во views и сериализаторах — никаких .save() и сложных вычислений.
"""
from __future__ import annotations

from dataclasses import dataclass

from django.db import transaction

from .models import Conversation, Message
from time import sleep


# Каталог подсказок для левой панели (категория → пункты).
SUGGESTIONS = [
    {
        "category": "Аналитика",
        "label": "Анализ загрузки врачей",
        "prompt": "Проанализируй загруженность врачей за неделю и предложи, как выровнять расписание.",
    },
    {
        "category": "Аналитика",
        "label": "Выручка за месяц",
        "prompt": "Покажи динамику выручки за месяц и назови ключевые точки роста.",
    },
    {
        "category": "Лиды",
        "label": "Лиды без ответа",
        "prompt": "Найди лиды без ответа более 24 часов и предложи follow-up.",
    },
    {
        "category": "Лиды",
        "label": "Сценарий обзвона",
        "prompt": "Составь сценарий обзвона новых лидов с возражениями по цене.",
    },
    {
        "category": "Пациенты",
        "label": "Повторные визиты",
        "prompt": "Кого из пациентов стоит пригласить на повторный визит в этом месяце?",
    },
    {
        "category": "Маркетинг",
        "label": "Идея рассылки",
        "prompt": "Предложи рассылку для реактивации пациентов, не приходивших полгода.",
    },
]


@dataclass
class AssistantReply:
    """Результат работы ассистента: текст и предлагаемые действия."""

    content: str
    tool_calls: list


def _suggested_actions(*names: str) -> list:
    """Кнопки-действия под ответом ассистента (см. дизайн)."""
    catalog = {
        "broadcast": {"action": "confirm_broadcast", "label": "Подтвердить рассылку"},
        "task": {"action": "create_task", "label": "Создать задачу"},
        "report": {"action": "open_report", "label": "Открыть отчёт"},
    }
    return [catalog[n] for n in names if n in catalog]


def generate_reply(text: str) -> AssistantReply:
    """
    Детерминированный ответ ассистента по ключевым словам запроса.
    Возвращает текст в формате Markdown-подобных строк и набор действий.
    """
    q = (text or "").lower()

    if any(w in q for w in ("загруж", "расписани", "врач")):
        return AssistantReply(
            content=(
                "Я проанализировал загруженность врачей за последнюю неделю:\n\n"
                "• Соколов А. А. — 92% (перегружен)\n"
                "• Михайлова Е. В. — 68%\n"
                "• Лебедев А. Н. — 41% (есть резерв)\n\n"
                "Рекомендую перенести часть первичных приёмов с Соколова на "
                "Лебедева — это выровняет нагрузку и сократит время ожидания "
                "пациентов. Подготовить отчёт или поставить задачу администратору?"
            ),
            tool_calls=_suggested_actions("report", "task"),
        )

    if any(w in q for w in ("лид", "обзвон", "follow", "ответ")):
        sleep(1)
        return AssistantReply(
            content=(
                "Нашёл 7 лидов без ответа более 24 часов. У 4 из них источник "
                "«Instagram», у 3 — «Сайт».\n\n"
                "Предлагаю отправить им follow-up в WhatsApp с напоминанием о "
                "консультации и индивидуальной скидкой 10%. Запустить рассылку "
                "или создать задачу на обзвон?"
            ),
            tool_calls=_suggested_actions("broadcast", "task"),
        )

    if any(w in q for w in ("повтор", "реактив", "пациент", "вернуть")):
        return AssistantReply(
            content=(
                "Выделил сегмент из 128 пациентов, не приходивших более 6 месяцев. "
                "Лучше всего реагируют на персональные приглашения по SMS.\n\n"
                "Могу подготовить рассылку с приглашением на профилактический осмотр "
                "и автозапись на свободные слоты ближайшей недели."
            ),
            tool_calls=_suggested_actions("broadcast", "report"),
        )

    if any(w in q for w in ("выруч", "доход", "финанс", "деньг")):
        return AssistantReply(
            content=(
                "Выручка за месяц — ₽ 3 482 600 (+8,4% к прошлому месяцу). "
                "Основной рост дали стоматология и косметология. Средний чек "
                "вырос до ₽ 6 480.\n\n"
                "Точка роста: конверсия лидов в запись держится на 34,7% — её "
                "можно поднять за счёт ускорения первого ответа."
            ),
            tool_calls=_suggested_actions("report"),
        )

    if any(w in q for w in ("рассылк", "маркетинг", "кампани", "акци")):
        return AssistantReply(
            content=(
                "Идея кампании реактивации: сегмент «не были 6+ месяцев», канал "
                "WhatsApp + SMS, оффер — бесплатная консультация при записи на этой "
                "неделе. Ожидаемая конверсия 6–8%, прогноз выручки ₽ 180 000.\n\n"
                "Подтвердить запуск рассылки?"
            ),
            tool_calls=_suggested_actions("broadcast", "report"),
        )

    return AssistantReply(
        content=(
            "Я ассистент клиники и помогаю с аналитикой загрузки врачей, работой "
            "с лидами, повторными визитами пациентов и маркетинговыми рассылками. "
            "Спросите, например: «Проанализируй загруженность врачей за неделю» "
            "или «Найди лиды без ответа»."
        ),
        tool_calls=[],
    )


def list_suggestions() -> list:
    """Подсказки для левой панели ассистента."""
    return SUGGESTIONS


@transaction.atomic
def create_conversation(*, user, title: str = "") -> Conversation:
    """Создаёт новый диалог с приветственным сообщением ассистента."""
    conversation = Conversation.objects.create(
        user=user,
        title=title or "Новый диалог",
        created_by=user,
        updated_by=user,
    )
    Message.objects.create(
        conversation=conversation,
        role="ASSISTANT",
        content=(
            "Здравствуйте! Я AI-ассистент клиники. Помогу разобраться с загрузкой "
            "врачей, лидами и рассылками. С чего начнём?"
        ),
        created_by=user,
        updated_by=user,
    )
    return conversation


@transaction.atomic
def send_message(*, conversation: Conversation, user, content: str) -> Message:
    """
    Сохраняет сообщение пользователя, генерирует ответ ассистента и
    сохраняет его. Возвращает сообщение ассистента.
    """
    Message.objects.create(
        conversation=conversation,
        role="USER",
        content=content,
        created_by=user,
        updated_by=user,
    )

    # Авто-заголовок диалога по первому вопросу пользователя.
    if conversation.title in ("", "Новый диалог"):
        conversation.title = content[:60]
        conversation.updated_by = user
        conversation.save(update_fields=["title", "updated_by", "updated_at"])

    reply = generate_reply(content)
    assistant_message = Message.objects.create(
        conversation=conversation,
        role="ASSISTANT",
        content=reply.content,
        tool_calls=reply.tool_calls,
        created_by=user,
        updated_by=user,
    )
    return assistant_message
