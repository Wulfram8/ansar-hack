from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .models import Appointment, Service
from .serializers import AppointmentSerializer, ServiceSerializer
from .filters import AppointmentFilter


class AppointmentPagination(PageNumberPagination):
    """Пагинация списка записей: ?page= & ?page_size=. Ответ — {count, results}."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = (
        Appointment.objects
        .select_related('patient', 'doctor', 'service')
        .all()
        .order_by('-date', '-start_time')
    )
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AppointmentPagination
    search_fields = [
        'comment', 'cabinet',
        'patient__first_name', 'patient__last_name', 'patient__phone',
        'doctor__first_name', 'doctor__last_name',
    ]
    filterset_class = AppointmentFilter
    ordering_fields = ['date', 'start_time', 'status', 'created_at']


class ServiceViewSet(viewsets.ModelViewSet):
    """Услуги клиники — для формы записи и справочника настроек."""
    queryset = Service.objects.all().order_by('title')
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    search_fields = ['title', 'code', 'category']
