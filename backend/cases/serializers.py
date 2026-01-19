# backend/cases/serializers.py

from rest_framework import serializers
from .models import ClinicalCase, Specialty, Diagnosis, PhysicalFinding, \
    ComplementaryExam, CurrentTreatment, MedicalHistory, Symptom  # Importez les autres modèles au besoin

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']

class ClinicalCaseListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour afficher une liste de cas.
    """
    specialties = SpecialtySerializer(many=True, read_only=True)
    class Meta:
        model = ClinicalCase
        fields = ['id', 'case_title', 'case_summary', 'specialties', 'status','difficulty', 'age', 'sexe', 'rejection_reason']


class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = '__all__'


class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = '__all__'


class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentTreatment
        fields = '__all__'


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplementaryExam
        fields = '__all__'


class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalFinding
        fields = '__all__'


class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class ClinicalCaseDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour afficher toutes les informations d'un seul cas.
    Nous le complexifierons plus tard pour inclure les symptômes, etc.
    """
    specialties = SpecialtySerializer(many=True, read_only=True)
    symptoms = SymptomSerializer(many=True, read_only=True)
    history_entries = MedicalHistorySerializer(many=True, read_only=True)
    current_treatments = TreatmentSerializer(many=True, read_only=True)
    exams = ExamSerializer(many=True, read_only=True)
    physical_findings = FindingSerializer(many=True, read_only=True)
    diagnoses = DiagnosisSerializer(many=True, read_only=True)

    class Meta:
        model = ClinicalCase
        fields = '__all__' # Inclut tous les champs du modèle








