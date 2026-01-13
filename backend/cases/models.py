from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class ClinicalCase(models.Model):
    class Status(models.TextChoices):
        NON_APPROUVE = 'non_approuve', 'Non Approuvé'
        APPROUVE = 'approuve', 'Approuvé'
        REJETE = 'rejete', 'Rejeté'

    source_fultang_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NON_APPROUVE)
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    case_title = models.CharField(max_length=255)
    case_summary = models.TextField(blank=True, null=True)
    learning_objectives = models.TextField(blank=True, null=True)
    motif_consultation = models.TextField()
    age = models.PositiveIntegerField()
    sexe = models.CharField(max_length=50)

    etat_civil = models.CharField(max_length=100, blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    nombre_enfant = models.PositiveIntegerField(blank=True, null=True)
    groupe_sanguin = models.CharField(max_length=10, blank=True, null=True)

    mode_de_vie = models.JSONField(null=True, blank=True)
    categories = models.ManyToManyField(Category, blank=True, related_name='cases')
    raw_llm_suggestions = models.JSONField(default=dict, blank=True)

    key_questions = models.JSONField(
        default=list,
        blank=True,
        null=True,
        help_text="Liste des questions clés que l'apprenant doit poser."
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Motif du rejet (rempli par l'expert)"
    )

    difficulty = models.CharField(
        max_length=20,
        choices=[('Facile', 'Facile'), ('Moyen', 'Moyen'), ('Difficile', 'Difficile')],
        default='Moyen',
        blank=True,
        null=True
    )

    reasoning_graph = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text="Structure nœuds/liens représentant le raisonnement clinique (généré par IA)."
    )

    def __str__(self):
        return f"Cas #{self.id} ({self.case_title}) - {self.get_status_display()}"


class Symptom(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='symptoms', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    localisation = models.CharField(max_length=200, blank=True, null=True)
    date_debut = models.CharField(max_length=100, blank=True, null=True)
    frequence = models.CharField(max_length=100, blank=True, null=True)
    duree = models.CharField(max_length=100, blank=True, null=True)
    evolution = models.TextField(blank=True, null=True)
    activite_declenchante = models.CharField(max_length=255, blank=True, null=True)
    degre = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} (Cas #{self.case.id})"


class MedicalHistory(models.Model):
    class HistoryType(models.TextChoices):
        MALADIE = 'maladie', 'Maladie'
        CHIRURGIE = 'chirurgie', 'Chirurgie'
        FAMILIAL = 'familial', 'Familiaux'
        ALLERGIE = 'allergie', 'Allergies'
        OBSTETRICAL = 'obstetrical', 'Obstétricaux'

    case = models.ForeignKey(ClinicalCase, related_name='history_entries', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=HistoryType.choices)
    description = models.TextField(help_text="Description générale")  # On garde pour la compatibilité

    # --- CHAMPS SPÉCIFIQUES (Selon votre graphe) ---
    # Pour Maladie / Chirurgie
    nom = models.CharField(max_length=200, blank=True, null=True)
    date = models.CharField(max_length=100, blank=True, null=True, help_text="Date ou Date début")
    date_fin = models.CharField(max_length=100, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)

    # Pour le Traitement lié à la maladie
    traitement_nom = models.CharField(max_length=200, blank=True, null=True)
    traitement_duree = models.CharField(max_length=100, blank=True, null=True)
    traitement_posologie = models.CharField(max_length=200, blank=True, null=True)

    # Pour Allergie
    declencheur = models.CharField(max_length=200, blank=True, null=True)
    manifestation = models.CharField(max_length=200, blank=True, null=True)

    # Pour Obstétrique
    nombre_grossesse = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.type}: {self.nom or self.description}"


class CurrentTreatment(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='current_treatments', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    posologie = models.CharField(max_length=200, blank=True, null=True)
    date_debut = models.CharField(max_length=100, blank=True, null=True)
    efficacite = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} (Cas #{self.case.id})"


class ComplementaryExam(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='exams', on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    resultat = models.TextField()
    anatomie = models.CharField(max_length=200, blank=True, null=True, help_text="Zone anatomique concernée")

    def __str__(self):
        return f"Examen : {self.nom} (Cas #{self.case.id})"


class PhysicalFinding(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='physical_findings', on_delete=models.CASCADE)
    nom_examen = models.CharField(max_length=200)
    resultat_observation = models.TextField()

    def __str__(self):
        return f"Examen physique : {self.nom_examen} (Cas #{self.case.id})"


class Diagnosis(models.Model):
    case = models.ForeignKey(ClinicalCase, related_name='diagnoses', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    is_final = models.BooleanField(default=False)

    def __str__(self):
        final_text = "[Final] " if self.is_final else ""
        return f"{final_text}{self.description} (Cas #{self.case.id})"


