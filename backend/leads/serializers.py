from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    # Человекочитаемые представления связей для карточки лида (Канбан).
    service_interest_title = serializers.CharField(
        source="service_interest.title", read_only=True, default=None
    )
    source_title = serializers.CharField(
        source="source.title", read_only=True, default=None
    )
    assigned_admin_name = serializers.SerializerMethodField()
    assigned_admin_initials = serializers.SerializerMethodField()
    hot = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = "__all__"

    def get_assigned_admin_name(self, obj):
        u = obj.assigned_admin
        if not u:
            return None
        full = f"{u.last_name} {u.first_name}".strip()
        return full or u.get_username()

    def get_assigned_admin_initials(self, obj):
        u = obj.assigned_admin
        if not u:
            return None
        initials = f"{(u.last_name or '')[:1]}{(u.first_name or '')[:1]}".upper()
        return initials or u.get_username()[:2].upper()

    def get_hot(self, obj):
        # Признак «горячего» лида хранится в utm-данных.
        return bool(isinstance(obj.utm, dict) and obj.utm.get("hot"))
