from django.shortcuts import render

# backend/cases/views.py

from rest_framework import viewsets, permissions
from .models import ClinicalCase
from .serializers import ClinicalCaseListSerializer, ClinicalCaseDetailSerializer


class ClinicalCaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour visualiser les cas cliniques.
    ReadOnly : on ne permet que la lecture via cette API pour l'instant.
    """
    queryset = ClinicalCase.objects.filter(status='approuve')  # Ne montre que les cas approuvés

    def get_serializer_class(self):
        # Utilise un serializer différent pour la liste et le détail
        if self.action == 'list':
            return ClinicalCaseListSerializer
        return ClinicalCaseDetailSerializer