import django_filters as filters

from .models import Lead


class LeadFilter(filters.FilterSet):
    """
    Фильтры воронки лидов под панель фильтров в дизайне (ZcbMF):
      - status          — стадия воронки
      - channel         — канал заявки
      - source          — источник по UUID
      - source_code     — источник по коду (site, instagram, ...)
      - assigned_admin  — ответственный по UUID
      - created_after / created_before — диапазон по дате создания
    """
    source_code = filters.CharFilter(field_name="source__code", lookup_expr="iexact")
    created_after = filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    created_before = filters.DateFilter(field_name="created_at", lookup_expr="date__lte")

    class Meta:
        model = Lead
        fields = ["status", "channel", "source", "source_code", "assigned_admin"]
