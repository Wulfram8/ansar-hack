from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Lead
from .serializers import LeadSerializer

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['first_name', 'last_name', 'phone', 'email', 'source__title']
    filterset_fields = ['status', 'converted_patient']
