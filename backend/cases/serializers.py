# backend/cases/serializers.py

from rest_framework import serializers
from .models import ClinicalCase, Category  # Importez les autres modèles au besoin

class ClinicalCaseListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour afficher une liste de cas.
    """
    class Meta:
        model = ClinicalCase
        fields = ['id', 'case_title', 'case_summary', 'categories', 'status', 'age', 'sexe']

class ClinicalCaseDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour afficher toutes les informations d'un seul cas.
    Nous le complexifierons plus tard pour inclure les symptômes, etc.
    """
    class Meta:
        model = ClinicalCase
        fields = '__all__' # Inclut tous les champs du modèle


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']