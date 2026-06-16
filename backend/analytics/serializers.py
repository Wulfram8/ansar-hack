from rest_framework import serializers


class KpiSerializer(serializers.Serializer):
    """Одна KPI-карточка в шапке дашборда."""
    key = serializers.CharField()
    label = serializers.CharField()
    value = serializers.CharField()
    delta = serializers.FloatField()
    delta_direction = serializers.ChoiceField(choices=["up", "down"])


class RevenuePointSerializer(serializers.Serializer):
    """Точка графика «Выручка по месяцам» (план/факт), в рублях."""
    month = serializers.CharField()
    plan = serializers.IntegerField()
    fact = serializers.IntegerField()


class PatientSourceSerializer(serializers.Serializer):
    """Сегмент пончиковой диаграммы «Источники пациентов»."""
    label = serializers.CharField()
    value = serializers.IntegerField()
    percent = serializers.FloatField()
    color = serializers.CharField()


class DoctorLoadSerializer(serializers.Serializer):
    """Строка таблицы «Загруженность врачей»."""
    name = serializers.CharField()
    specialty = serializers.CharField()
    appointments = serializers.IntegerField()
    revenue_kopecks = serializers.IntegerField()


class TopServiceSerializer(serializers.Serializer):
    """Строка списка «Топ услуги» с прогресс-баром."""
    title = serializers.CharField()
    count = serializers.IntegerField()
    revenue_kopecks = serializers.IntegerField()
    percent = serializers.FloatField()


class DashboardSerializer(serializers.Serializer):
    """Полный ответ эндпоинта дашборда."""
    period_label = serializers.CharField()
    patient_sources_total = serializers.IntegerField()
    kpis = KpiSerializer(many=True)
    revenue_by_month = RevenuePointSerializer(many=True)
    patient_sources = PatientSourceSerializer(many=True)
    doctor_load = DoctorLoadSerializer(many=True)
    top_services = TopServiceSerializer(many=True)
