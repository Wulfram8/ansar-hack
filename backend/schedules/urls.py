from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ScheduleBoardView, DoctorScheduleViewSet, ScheduleExceptionViewSet

router = DefaultRouter()
router.register(r'shifts', DoctorScheduleViewSet, basename='doctor-schedule')
router.register(r'exceptions', ScheduleExceptionViewSet, basename='schedule-exception')

urlpatterns = [
    path("board/", ScheduleBoardView.as_view(), name="schedule-board"),
    path("", include(router.urls)),
]
