# backend/evaluation/models.py

from django.db import models
from simulation.models import ChatMessage, SimulationSession


class EvaluationLog(models.Model):
    """
    Stocke l'analyse pédagogique d'un échange spécifique.
    Lié en OneToOne au message de l'apprenant.
    """
    message = models.OneToOneField(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name='evaluation'
    )

    # Scores quantitatifs
    relevance_score = models.IntegerField(help_text="Pertinence diagnostique (0-10)")
    empathy_score = models.IntegerField(help_text="Qualité de la communication (0-10)", null=True, blank=True)

    # Analyse qualitative
    reasoning = models.TextField(help_text="Explication du score par l'IA")
    pedagogical_feedback = models.TextField(help_text="Conseil ou question socratique pour l'étudiant", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Eval du message {self.message.id} - Score: {self.relevance_score}/10"


class FinalReport(models.Model):
    """
    Le rapport de fin de session généré par l'IA.
    """
    session = models.OneToOneField(
        SimulationSession,
        on_delete=models.CASCADE,
        related_name='report'
    )

    # Indicateurs clés
    score_global = models.IntegerField(help_text="Score global sur 100")
    diagnostic_found = models.BooleanField(default=False, help_text="L'étudiant a-t-il trouvé le bon diagnostic ?")

    # Analyse qualitative (JSON pour flexibilité d'affichage)
    feedback_strengths = models.JSONField(default=list, help_text="Liste des points forts")
    feedback_improvements = models.JSONField(default=list, help_text="Liste des points à améliorer")

    # Analyse détaillée
    detailed_analysis = models.TextField(help_text="Paragraphe de synthèse du professeur")

    # Suivi des questions clés (Quelles questions obligatoires ont été posées ?)
    key_questions_status = models.JSONField(default=dict, help_text="{ 'Question A': true, 'Question B': false }")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rapport Session {self.session.id} - Score: {self.score_global}"