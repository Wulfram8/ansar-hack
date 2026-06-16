from django.urls import path

from .views import ScheduleBoardView

urlpatterns = [
    path("board/", ScheduleBoardView.as_view(), name="schedule-board"),
]
