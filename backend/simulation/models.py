from django.db import models
from django.conf import settings
from cases.models import ClinicalCase


class SimulationSession(models.Model):
    """
    Représente une session de simulation complète, liant un apprenant à un cas clinique.
    C'est le conteneur principal pour une interaction.
    """

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

    start_time = models.DateTimeField(
        auto_now_add=True,
        help_text="Date et heure de début de la session."
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date et heure de fin de la session."
    )

    class Meta:
        ordering = ['-start_time']
        verbose_name = "Session de Simulation"
        verbose_name_plural = "Sessions de Simulation"

    def __str__(self):
        return f"Session #{self.id} de {self.apprenant.username} sur le cas '{self.case.case_title}'"


class ChatMessage(models.Model):
    """
    Représente un message unique échangé au cours d'une session de simulation.
    """

    class Sender(models.TextChoices):
        APPRENANT = 'APPRENANT', 'Apprenant'
        PATIENT_IA = 'PATIENT_IA', 'Patient IA'
        SYSTEM = 'SYSTEM', 'Système'  # Pour des messages de tutorat ou d'événements

    session = models.ForeignKey(
        SimulationSession,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="La session à laquelle ce message appartient."
    )
    sender = models.CharField(
        max_length=20,
        choices=Sender.choices,
        help_text="Qui a envoyé le message."
    )
    content = models.TextField(
        help_text="Le contenu textuel du message."
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="Date et heure d'enregistrement du message."
    )

    class Meta:
        ordering = ['timestamp']
        verbose_name = "Message de Chat"
        verbose_name_plural = "Messages de Chat"

    def __str__(self):
        return f"Message de {self.get_sender_display()} à {self.timestamp.strftime('%H:%M:%S')}"