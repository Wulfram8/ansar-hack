from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    """Одно сообщение диалога."""

    class Meta:
        model = Message
        fields = ["id", "role", "content", "tool_calls", "created_at"]
        read_only_fields = ["id", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    """Краткое представление диалога для списка слева."""

    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "context",
            "last_message",
            "message_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return msg.content if msg else ""

    def get_message_count(self, obj):
        return obj.messages.count()


class ConversationDetailSerializer(ConversationSerializer):
    """Диалог с полной историей сообщений."""

    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ["messages"]


class SendMessageSerializer(serializers.Serializer):
    """Входные данные для отправки сообщения ассистенту."""

    content = serializers.CharField(allow_blank=False, trim_whitespace=True)


class SuggestionSerializer(serializers.Serializer):
    """Подсказка-промпт в левой панели ассистента."""

    category = serializers.CharField()
    label = serializers.CharField()
    prompt = serializers.CharField()
