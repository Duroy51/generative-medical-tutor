from django.shortcuts import render

# backend/cases/views.py

from rest_framework import viewsets, permissions
from .models import ClinicalCase, Category
from .serializers import ClinicalCaseListSerializer, ClinicalCaseDetailSerializer, CategorySerializer


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

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet de lister les catégories pour les filtres du frontend.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # Pas besoin de permissions strictes pour lire les catégories, mais IsAuthenticated est bien