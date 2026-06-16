import django_filters as filters

from .models import Appointment


class AppointmentFilter(filters.FilterSet):
    """
    Фильтры списка записей под панель фильтров на фронте:
      - status        — статус записи (CREATED/CONFIRMED/...)
      - patient       — по UUID пациента
      - doctor        — по UUID врача
      - date          — точная дата
      - date_after / date_before — диапазон по дате
    """
    date_after = filters.DateFilter(field_name="date", lookup_expr="gte")
    date_before = filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Appointment
        fields = ["status", "patient", "doctor", "date"]
