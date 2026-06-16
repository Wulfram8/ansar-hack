import django_filters as filters

from .models import Patient


class PatientFilter(filters.FilterSet):
    """
    Фильтры списка пациентов под панель фильтров в дизайне (iJVJY):
      - status         — статус (NEW/ACTIVE/...)
      - gender         — пол
      - source         — источник по UUID
      - source_code    — источник по коду (site, instagram, ...)
      - tag            — по подписи тега (например, «VIP»)
      - last_visit_after / last_visit_before — диапазон последнего визита
    """
    source_code = filters.CharFilter(field_name="source__code", lookup_expr="iexact")
    tag = filters.CharFilter(field_name="tags__label", lookup_expr="iexact")
    last_visit_after = filters.DateFilter(field_name="last_visit_date", lookup_expr="gte")
    last_visit_before = filters.DateFilter(field_name="last_visit_date", lookup_expr="lte")

    class Meta:
        model = Patient
        fields = ["status", "gender", "source", "source_code", "tag"]
