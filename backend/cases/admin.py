from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import (
    ClinicalCase, Symptom, MedicalHistory, CurrentTreatment,
    ComplementaryExam, PhysicalFinding, Diagnosis
)


class SymptomInline(admin.TabularInline):
    model = Symptom
    extra = 1

class MedicalHistoryInline(admin.TabularInline):
    model = MedicalHistory
    extra = 1

class CurrentTreatmentInline(admin.TabularInline):
    model = CurrentTreatment
    extra = 1

class ComplementaryExamInline(admin.TabularInline):
    model = ComplementaryExam
    extra = 1

class DiagnosisInline(admin.TabularInline):
    model = Diagnosis
    extra = 1

class PhysicalFindingInline(admin.TabularInline):
    model = PhysicalFinding
    extra = 1


@admin.register(ClinicalCase)
class ClinicalCaseAdmin(admin.ModelAdmin):
    # Ce qu'on voit dans la liste des cas
    list_display = ('id', 'case_title', 'status','display_categories', 'validated_by', 'updated_at', )
    # Permet de filtrer par statut et catégorie
    list_filter = ('status', 'categories')
    filter_horizontal = ('categories',)
    # Permet de faire une recherche
    search_fields = ('case_title', 'case_summary')
    # Permet d'éditer les symptômes et antécédents directement depuis la page du cas
    inlines = [SymptomInline, MedicalHistoryInline]

    def display_categories(self, obj):
        return ", ".join([category.name for category in obj.categories.all()])

    display_categories.short_description = 'Catégories'


admin.site.register(Symptom)
admin.site.register(MedicalHistory)
admin.site.register(CurrentTreatment)
admin.site.register(ComplementaryExam)
admin.site.register(PhysicalFinding)
admin.site.register(Diagnosis)