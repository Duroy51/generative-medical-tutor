# backend/cases/models.py

from django.db import models
from django.conf import settings



class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Spécialité"
        verbose_name_plural = "Spécialités"

    def __str__(self):
        return self.name


# --- Modèle Cas Clinique ---
class ClinicalCase(models.Model):
    class Status(models.TextChoices):
        NON_APPROUVE = 'non_approuve', 'Non Approuvé'
        APPROUVE = 'approuve', 'Approuvé'
        REJETE = 'rejete', 'Rejeté'

    class Difficulty(models.TextChoices):
        FACILE = 'Facile', 'Facile'
        MOYEN = 'Moyen', 'Moyen'
        DIFFICILE = 'Difficile', 'Difficile'

    # --- CHAMPS DE GESTION ---
    source_fultang_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NON_APPROUVE)
    rejection_reason = models.JSONField(default=dict, blank=True, null=True)
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- CHAMPS PÉDAGOGIQUES ---
    case_title = models.CharField(max_length=255)
    case_summary = models.TextField(blank=True, null=True)
    learning_objectives = models.TextField(blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MOYEN, blank=True,
                                  null=True)

    # Ces champs étaient manquants et causaient l'erreur :
    common_pitfalls = models.TextField(blank=True, null=True, help_text="Erreurs fréquentes à éviter")
    key_questions = models.JSONField(default=list, blank=True, null=True)

    # --- CHAMPS SIMULATION / IA (Boîte de Verre) ---
    # Ces champs étaient aussi manquants :
    patient_persona = models.TextField(blank=True, null=True, help_text="Personnalité du patient")
    initial_statement = models.TextField(blank=True, null=True, help_text="Phrase d'intro")
    system_prompt_patient = models.TextField(blank=True, null=True, help_text="Prompt système exact")
    system_prompt_tutor = models.TextField(blank=True, null=True, help_text="Prompt tuteur exact")
    reasoning_graph = models.JSONField(default=dict, blank=True, null=True, help_text="Graphe de logique")
    raw_llm_suggestions = models.JSONField(default=dict, blank=True)

    # --- CHAMPS CLINIQUES ---
    motif_consultation = models.TextField()
    age = models.PositiveIntegerField()
    sexe = models.CharField(max_length=50)
    etat_civil = models.CharField(max_length=100, blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    nombre_enfant = models.PositiveIntegerField(blank=True, null=True)
    groupe_sanguin = models.CharField(max_length=10, blank=True, null=True)

    mode_de_vie = models.JSONField(null=True, blank=True)

    # Relations
    specialties = models.ManyToManyField(Specialty, blank=True, related_name='cases')

    def __str__(self):
        return f"Cas #{self.id} ({self.case_title})"




class Symptom(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='symptoms', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    # Tous les détails sont optionnels
    localisation = models.CharField(max_length=200, blank=True, null=True)
    date_debut = models.CharField(max_length=100, blank=True, null=True)
    frequence = models.CharField(max_length=100, blank=True, null=True)
    duree = models.CharField(max_length=100, blank=True, null=True)
    evolution = models.TextField(blank=True, null=True)
    activite_declenchante = models.CharField(max_length=255, blank=True, null=True)
    degre = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self): return self.nom


class MedicalHistory(models.Model):
    class HistoryType(models.TextChoices):
        MALADIE = 'maladie', 'Maladie'
        CHIRURGIE = 'chirurgie', 'Chirurgie'
        FAMILIAL = 'familial', 'Familiaux'
        ALLERGIE = 'allergie', 'Allergies'
        OBSTETRICAL = 'obstetrical', 'Obstétricaux'

    case = models.ForeignKey(ClinicalCase, related_name='history_entries', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=HistoryType.choices)

    # --- CORRECTION ICI : description devient optionnelle ---
    description = models.TextField(blank=True, null=True)

    # Détails spécifiques
    nom = models.CharField(max_length=200, blank=True, null=True)
    date = models.CharField(max_length=100, blank=True, null=True)
    date_fin = models.CharField(max_length=100, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    traitement_nom = models.CharField(max_length=200, blank=True, null=True)
    traitement_duree = models.CharField(max_length=100, blank=True, null=True)
    traitement_posologie = models.CharField(max_length=200, blank=True, null=True)
    declencheur = models.CharField(max_length=200, blank=True, null=True)
    manifestation = models.CharField(max_length=200, blank=True, null=True)
    nombre_grossesse = models.IntegerField(blank=True, null=True)

    def __str__(self): return f"{self.type}: {self.nom or self.description}"


class CurrentTreatment(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='current_treatments', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    posologie = models.CharField(max_length=200, blank=True, null=True)
    date_debut = models.CharField(max_length=100, blank=True, null=True)
    efficacite = models.TextField(blank=True, null=True)

    def __str__(self): return self.nom


class ComplementaryExam(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='exams', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)


    resultat = models.TextField(blank=True, null=True)
    anatomie = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self): return self.nom


class PhysicalFinding(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='physical_findings', on_delete=models.CASCADE)
    nom_examen = models.CharField(max_length=200)


    resultat_observation = models.TextField(blank=True, null=True)

    def __str__(self): return self.nom_examen


class Diagnosis(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='diagnoses', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    is_final = models.BooleanField(default=False)

    def __str__(self): return self.description