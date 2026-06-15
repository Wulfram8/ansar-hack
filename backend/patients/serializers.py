from rest_framework import serializers
from .models import Patient, PatientTag, PatientSource


class PatientTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientTag
        fields = ['id', 'label', 'color']


class PatientSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientSource
        fields = ['id', 'code', 'title']


class PatientSerializer(serializers.ModelSerializer):
    # Человекочитаемые представления связей (для таблицы пациентов).
    source_detail = PatientSourceSerializer(source='source', read_only=True)
    tags_detail = PatientTagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'
