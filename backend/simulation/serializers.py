from rest_framework import serializers
from .models import SimulationSession, ChatMessage
from cases.serializers import ClinicalCaseListSerializer
from evaluation.models import EvaluationLog

# --- AJOUT DU SERIALIZER POUR L'EVALUATION ---
class EvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationLog
        fields = ['relevance_score', 'empathy_score', 'pedagogical_feedback']

class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle ChatMessage.
    Inclut maintenant les données d'évaluation liées (feedback tuteur).
    """
    # On utilise le related_name 'evaluation' défini dans le modèle EvaluationLog
    evaluation = EvaluationLogSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'content', 'timestamp', 'evaluation']
        read_only_fields = ['id', 'session', 'sender', 'timestamp', 'evaluation']


class SimulationSessionSerializer(serializers.ModelSerializer):
    case = ClinicalCaseListSerializer(read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SimulationSession
        fields = ['id', 'case', 'apprenant', 'status', 'start_time', 'end_time', 'messages', 'student_diagnosis', 'student_prescription']


class StartSimulationSerializer(serializers.Serializer):
    case_id = serializers.IntegerField(required=False, help_text="ID du cas.")
    force_new = serializers.BooleanField(required=False, default=False)

    def validate_case_id(self, value):
        from cases.models import ClinicalCase
        try:
            case = ClinicalCase.objects.get(id=value, status=ClinicalCase.Status.APPROUVE)
        except ClinicalCase.DoesNotExist:
            raise serializers.ValidationError("Le cas clinique avec cet ID n'existe pas ou n'est pas approuvé.")
        return value