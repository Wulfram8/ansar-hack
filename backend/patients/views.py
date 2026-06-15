from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Patient
from .serializers import PatientSerializer


class PatientPagination(PageNumberPagination):
    """Пагинация списка пациентов: ?page= & ?page_size=. Ответ — {count, results}."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('last_name', 'first_name')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PatientPagination
    # Поля модели: phone (не phone_number), birth_date (не date_of_birth).
    search_fields = ['first_name', 'last_name', 'middle_name', 'phone', 'email']
    filterset_fields = ['status', 'gender', 'source']
    ordering_fields = ['last_name', 'first_name', 'birth_date', 'last_visit_date',
                       'total_revenue_kopecks', 'created_at']
