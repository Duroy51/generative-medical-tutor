from django.db import models
from django.conf import settings
from cases.models import ClinicalCase


class SimulationSession(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'En Cours'
        COMPLETED = 'completed', 'Terminée'
        CANCELED = 'canceled', 'Annulée'

    case = models.ForeignKey(
        ClinicalCase,
        on_delete=models.PROTECT,
        related_name='simulation_sessions',
        help_text="Le cas clinique utilisé pour cette simulation."
    )
    apprenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='simulation_sessions',
        help_text="L'utilisateur qui participe à la simulation."
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS
    )

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    # --- NOUVEAUX CHAMPS POUR LA DÉCISION CLINIQUE ---
    student_diagnosis = models.TextField(
        blank=True,
        null=True,
        help_text="Le diagnostic final posé par l'étudiant."
    )
    student_prescription = models.TextField(
        blank=True,
        null=True,
        help_text="Le traitement et la conduite à tenir proposés."
    )

    # -------------------------------------------------

    class Meta:
        ordering = ['-start_time']
        verbose_name = "Session de Simulation"
        verbose_name_plural = "Sessions de Simulation"

    def __str__(self):
        return f"Session #{self.id} - {self.apprenant.username}"


class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        APPRENANT = 'APPRENANT', 'Apprenant'
        PATIENT_IA = 'PATIENT_IA', 'Patient IA'
        TUTEUR = 'TUTEUR', 'Tuteur Pédagogique'

    session = models.ForeignKey(
        SimulationSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.CharField(max_length=20, choices=Sender.choices)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.get_sender_display()}: {self.content[:50]}..."