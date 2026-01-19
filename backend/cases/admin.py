# backend/cases/admin.py

from django.contrib import admin
from .models import (
    ClinicalCase, Specialty, Symptom, MedicalHistory,
    CurrentTreatment, ComplementaryExam, PhysicalFinding, Diagnosis
)


# --- Administration des Spécialités ---
@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


# --- Inlines pour le cas clinique ---
class SymptomInline(admin.TabularInline):
    model = Symptom
    extra = 0


class MedicalHistoryInline(admin.TabularInline):
    model = MedicalHistory
    extra = 0


class TreatmentInline(admin.TabularInline):
    model = CurrentTreatment
    extra = 0


class ExamInline(admin.TabularInline):
    model = ComplementaryExam
    extra = 0


class FindingInline(admin.TabularInline):
    model = PhysicalFinding
    extra = 0


class DiagnosisInline(admin.TabularInline):
    model = Diagnosis
    extra = 0


# --- Administration des Cas Cliniques ---
@admin.register(ClinicalCase)
class ClinicalCaseAdmin(admin.ModelAdmin):
    # On utilise 'display_specialties' au lieu de 'display_categories'
    list_display = ('id', 'case_title', 'status', 'display_specialties', 'difficulty', 'updated_at')

    # On filtre sur 'specialties' au lieu de 'categories'
    list_filter = ('status', 'difficulty', 'specialties')

    search_fields = ('case_title', 'case_summary', 'source_fultang_id')

    # On utilise le widget horizontal pour 'specialties'
    filter_horizontal = ('specialties',)

    # Configuration des champs éditables
    fieldsets = (
        ('Gestion Système', {
            'fields': ('source_fultang_id', 'status', 'rejection_reason', 'validated_by')
        }),
        ('Classification', {
            'fields': ('specialties', 'difficulty')  # <--- ICI AUSSI
        }),
        ('Contenu Clinique', {
            'fields': ('case_title', 'case_summary', 'motif_consultation', 'age', 'sexe', 'etat_civil', 'profession',
                       'mode_de_vie')
        }),
        ('Pédagogie & IA', {
            'fields': ('learning_objectives', 'key_questions', 'common_pitfalls', 'patient_persona',
                       'initial_statement', 'system_prompt_patient', 'system_prompt_tutor', 'reasoning_graph',
                       'raw_llm_suggestions')
        }),
    )

    inlines = [
        SymptomInline,
        MedicalHistoryInline,
        TreatmentInline,
        ExamInline,
        FindingInline,
        DiagnosisInline
    ]

    # Méthode pour afficher joliment les spécialités
    def display_specialties(self, obj):
        return ", ".join([s.name for s in obj.specialties.all()])

    display_specialties.short_description = 'Spécialités'


# Enregistrement des autres modèles
admin.site.register(Symptom)
admin.site.register(MedicalHistory)
admin.site.register(CurrentTreatment)
admin.site.register(ComplementaryExam)
admin.site.register(PhysicalFinding)
admin.site.register(Diagnosis)