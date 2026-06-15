from django.urls import path

from .views import (
    SendOtpView,
    VerifyOtpView,
    ClientProfileView,
    DoctorListView,
    DoctorDetailView,
    ClientAppointmentListCreateView,
    ClientAppointmentDetailView,
    ClientLeadCreateView,
)

app_name = 'client_api'

urlpatterns = [
    # Auth
    path('auth/send-otp/', SendOtpView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOtpView.as_view(), name='verify-otp'),

    # Profile
    path('profile/', ClientProfileView.as_view(), name='profile'),

    # Doctors
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<uuid:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),

    # Appointments
    path('appointments/', ClientAppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<uuid:pk>/', ClientAppointmentDetailView.as_view(), name='appointment-detail'),

    # Leads
    path('leads/', ClientLeadCreateView.as_view(), name='lead-create'),
]
