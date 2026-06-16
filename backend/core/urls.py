from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from accounts.views import UserViewSet, RoleViewSet, DoctorViewSet
from patients.views import PatientViewSet, PatientSourceViewSet, PatientTagViewSet
from leads.views import LeadViewSet
from appointments.views import AppointmentViewSet, ServiceViewSet
from notifications.views import (
    NotificationTemplateViewSet,
    AutomationRuleViewSet,
    ScheduledNotificationViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'patient-sources', PatientSourceViewSet, basename='patient-source')
router.register(r'patient-tags', PatientTagViewSet, basename='patient-tag')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'notifications/templates', NotificationTemplateViewSet, basename='notification-template')
router.register(r'notifications/rules', AutomationRuleViewSet, basename='automation-rule')
router.register(r'notifications/scheduled', ScheduledNotificationViewSet, basename='scheduled-notification')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/analytics/', include('analytics.urls')),
    path('api/schedules/', include('schedules.urls')),
    path('api/assistant/', include('ai_assistant.urls')),
    path('api/auth-token/', obtain_auth_token, name='api_token_auth'),
    path('api/client/', include('client_api.urls')),
    
    # Swagger API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
