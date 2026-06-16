from django.urls import path

from .views import (
    SendOtpView,
    VerifyOtpView,
    ClientProfileView,
    DoctorListView,
    DoctorDetailView,
    ClientServiceListView,
    ClientAppointmentListCreateView,
    ClientAppointmentDetailView,
    ClientLeadCreateView,
    ClientChatListView,
    ClientChatDetailView,
    ClientChatByAppointmentView,
    ClientChatSendMessageView,
    ClientNotificationListView,
    ClientNotificationMarkReadView,
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

    # Services
    path('services/', ClientServiceListView.as_view(), name='service-list'),

    # Appointments
    path('appointments/', ClientAppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<uuid:pk>/', ClientAppointmentDetailView.as_view(), name='appointment-detail'),

    # Doctor Chat
    path('chats/', ClientChatListView.as_view(), name='chat-list'),
    path('chats/<uuid:pk>/', ClientChatDetailView.as_view(), name='chat-detail'),
    path('chats/appointment/<uuid:appointment_id>/', ClientChatByAppointmentView.as_view(), name='chat-by-appointment'),
    path('chats/<uuid:chat_id>/send/', ClientChatSendMessageView.as_view(), name='chat-send-message'),

    # Notifications
    path('notifications/', ClientNotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/', ClientNotificationMarkReadView.as_view(), name='notification-mark-read'),

    # Leads
    path('leads/', ClientLeadCreateView.as_view(), name='lead-create'),
]
