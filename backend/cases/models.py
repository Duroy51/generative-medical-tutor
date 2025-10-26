# backend/cases/models.py

from django.db import models
from django.conf import settings




class ClinicalCase(models.Model):
    """
    Le modèle principal qui représente un cas clinique complet.
    C'est le pivot de toutes les autres informations.
    """


    class Status(models.TextChoices):
        NON_APPROUVE = 'non_approuve', 'Non Approuvé'
        APPROUVE = 'approuve', 'Approuvé'
        REJETE = 'rejete', 'Rejeté'


    source_fultang_id = models.CharField(max_length=100, unique=True,
                                         help_text="Identifiant unique du cas dans Fultang")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NON_APPROUVE)
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                     help_text="Expert qui a validé le cas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Données Pédagogiques (Générées par le LLM et validées par l'expert)
    case_title = models.CharField(max_length=255,
                                  help_text="Titre concis du cas, ex: 'Douleur thoracique chez un homme de 55 ans'")
    case_summary = models.TextField(help_text="Résumé du cas pour présenter la situation à l'apprenant")
    learning_objectives = models.TextField(
        help_text="Objectifs pédagogiques que l'apprenant doit atteindre avec ce cas")

    # --- Données Personnelles Anonymisées (correspondant à la Figure 1) ---
    motif_consultation = models.TextField()
    age = models.PositiveIntegerField()
    sexe = models.CharField(max_length=50)
    etat_civil = models.CharField(max_length=100, blank=True)
    profession = models.CharField(max_length=100, blank=True)
    nombre_enfant = models.PositiveIntegerField(default=0)
    groupe_sanguin = models.CharField(max_length=10, blank=True)

    # --- Données sur le Mode de Vie (regroupées pour la simplicité) ---
    mode_de_vie = models.JSONField(null=True, blank=True,
                                   help_text="Objet JSON contenant des infos sur voyage, activité physique, addiction, etc.")

    def __str__(self):
        return f"Cas #{self.id} ({self.case_title}) - {self.get_status_display()}"


# ==============================================================================
# MODÈLES LIÉS : Informations multiples associées à un cas clinique
# ==============================================================================

class Symptom(models.Model):
    """Un symptôme spécifique rapporté par le patient."""
    case = models.ForeignKey(ClinicalCase, related_name='symptoms', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    localisation = models.CharField(max_length=200, blank=True)
    date_debut = models.CharField(max_length=100, help_text="ex: 'il y a 3 jours', 'depuis ce matin'")
    frequence = models.CharField(max_length=100, blank=True)
    duree = models.CharField(max_length=100, blank=True)
    evolution = models.TextField(blank=True)
    activite_declenchante = models.CharField(max_length=255, blank=True)
    degre = models.PositiveIntegerField(help_text="Échelle de douleur/sévérité, ex: 8 sur 10")

    def __str__(self):
        return f"{self.nom} (Cas #{self.case.id})"


class MedicalHistory(models.Model):
    """Modèle unifié pour tous les types d'antécédents (personnels et familiaux)."""

    class HistoryType(models.TextChoices):
        MEDICAL = 'medical', 'Médical'
        CHIRURGICAL = 'chirurgical', 'Chirurgical'
        OBSTETRICAL = 'obstetrical', 'Obstétrical'
        FAMILIAL = 'familial', 'Familial'
        ALLERGIE = 'allergie', 'Allergie'

    case = models.ForeignKey(ClinicalCase, related_name='history_entries', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=HistoryType.choices)
    description = models.TextField(
        help_text="Détail de l'antécédent, ex: 'Diabète de type 2', 'Appendicectomie en 2010', 'Père décédé d'un infarctus'")

    def __str__(self):
        return f"Antécédent {self.get_type_display()} (Cas #{self.case.id})"


class CurrentTreatment(models.Model):
    """Un traitement que le patient suit actuellement."""
    case = models.ForeignKey(ClinicalCase, related_name='current_treatments', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200, help_text="Nom du médicament ou du traitement")
    posologie = models.CharField(max_length=200, blank=True)
    date_debut = models.CharField(max_length=100, blank=True)
    efficacite = models.TextField(blank=True, help_text="Comment le patient perçoit l'efficacité")

    def __str__(self):
        return f"{self.nom} (Cas #{self.case.id})"


class ComplementaryExam(models.Model):
    """Résultat d'un examen complémentaire (biologie, imagerie, etc.)."""
    case = models.ForeignKey(ClinicalCase, related_name='exams', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200, help_text="ex: 'NFS', 'Radiographie du thorax'")
    resultat = models.TextField(help_text="Résultats complets ou interprétation")

    def __str__(self):
        return f"Examen : {self.nom} (Cas #{self.case.id})"


class PhysicalFinding(models.Model):
    """Une observation faite lors de l'examen physique du patient."""
    case = models.ForeignKey(ClinicalCase, related_name='physical_findings', on_delete=models.CASCADE)
    nom_examen = models.CharField(max_length=200, help_text="ex: 'Auscultation cardiaque', 'Palpation abdominale'")
    resultat_observation = models.TextField(
        help_text="ex: 'Bruits du cœur réguliers, pas de souffle', 'Abdomen souple et dépressible'")

    def __str__(self):
        return f"Examen physique : {self.nom_examen} (Cas #{self.case.id})"


class Diagnosis(models.Model):
    """
    Un diagnostic, qu'il soit différentiel ou final.
    Essentiel pour la partie pédagogique (vérité terrain).
    """
    case = models.ForeignKey(ClinicalCase, related_name='diagnoses', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    is_final = models.BooleanField(default=False, help_text="Cochez si c'est le diagnostic final confirmé")

    def __str__(self):
        final_text = "[Final] " if self.is_final else ""
        return f"{final_text}{self.description} (Cas #{self.case.id})"