from rest_framework import serializers
from .models import SimulationSession, ChatMessage
from cases.serializers import ClinicalCaseListSerializer  # Pour afficher les détails du cas


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle ChatMessage.
    Utilisé pour afficher un message de chat.
    """

    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'content', 'timestamp']
        read_only_fields = ['id', 'session', 'sender', 'timestamp']  # L'utilisateur ne peut fournir que 'content'


class SimulationSessionSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour le modèle SimulationSession.
    Il inclut les détails du cas associé et les messages de la conversation.
    """
    # 'case' est un ForeignKey. Pour afficher plus que juste l'ID, on imbrique un autre serializer.
    case = ClinicalCaseListSerializer(read_only=True)

    # 'messages' est une relation inverse (related_name). On peut l'inclure aussi.
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SimulationSession
        fields = ['id', 'case', 'apprenant', 'status', 'start_time', 'end_time', 'messages']


class StartSimulationSerializer(serializers.Serializer):
    """
    Serializer spécialisé pour la validation des données lors de la création d'une session.
    Il ne correspond pas directement à un modèle, mais définit les champs attendus par l'API.
    """
    case_id = serializers.IntegerField(required=True, help_text="L'ID du cas clinique à simuler.")

    # On pourrait ajouter d'autres options ici plus tard, comme le niveau de difficulté souhaité.

    def validate_case_id(self, value):
        """
        Validation personnalisée pour s'assurer que le cas_id est valide et utilisable.
        """
        from cases.models import ClinicalCase
        try:
            case = ClinicalCase.objects.get(id=value, status=ClinicalCase.Status.APPROUVE)
        except ClinicalCase.DoesNotExist:
            raise serializers.ValidationError("Le cas clinique avec cet ID n'existe pas ou n'est pas approuvé.")
        return value