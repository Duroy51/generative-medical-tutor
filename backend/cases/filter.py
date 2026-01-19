# backend/cases/filters.py
import django_filters
from .models import ClinicalCase

class ClinicalCaseFilter(django_filters.FilterSet):
    specialties = django_filters.NumberFilter(field_name='specialties__id')
    age = django_filters.NumberFilter(field_name='age')
    symptom = django_filters.CharFilter(field_name='symptoms__nom', lookup_expr='icontains')
    diagnosis = django_filters.CharFilter(field_name='diagnoses__description', lookup_expr='icontains')
    difficulty = django_filters.CharFilter(lookup_expr='iexact')
    status = django_filters.CharFilter(lookup_expr='iexact')

    class Meta:
        model = ClinicalCase
        fields = ['status', 'difficulty', 'specialties', 'age']