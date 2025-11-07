# backend/simulation/views.py

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import SimulationSession, ChatMessage
from .serializers import ChatMessageSerializer, StartSimulationSerializer, SimulationSessionSerializer
from cases.models import ClinicalCase


from .agent.simulator import PatientSimulatorAgent




class PostMessageView(generics.GenericAPIView):
    """
    Endpoint pour qu'un apprenant envoie un message dans une session
    et reçoive la réponse de l'IA.
    URL : /api/simulations/<int:session_id>/message/
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        session_id = self.kwargs.get('session_id')
        try:

            session = SimulationSession.objects.get(id=session_id, apprenant=request.user)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

        user_message_content = request.data.get('content')
        if not user_message_content:
            return Response({"error": "Le contenu du message est requis."}, status=status.HTTP_400_BAD_REQUEST)


        ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.APPRENANT,
            content=user_message_content
        )


        try:
            agent = PatientSimulatorAgent(case=session.case, session_id=session.id)
            ai_response_content = agent.generate_response(user_message=user_message_content)
        except Exception as e:
            return Response({"error": f"Erreur lors de la génération de la réponse de l'IA : {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        ai_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.PATIENT_IA,
            content=ai_response_content
        )

        # 4. Renvoyer la réponse de l'IA au frontend
        serializer = self.get_serializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class StartSimulationView(generics.CreateAPIView):
        """
        Endpoint pour démarrer une nouvelle session de simulation.
        Accepte un 'case_id' en POST et crée une session.
        URL: /api/simulations/start/
        """
        serializer_class = StartSimulationSerializer
        permission_classes = [IsAuthenticated]

        def create(self, request, *args, **kwargs):

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data
            case_id = validated_data['case_id']


            existing_session = SimulationSession.objects.filter(
                apprenant=request.user,
                case_id=case_id,
                status=SimulationSession.Status.IN_PROGRESS
            ).first()

            if existing_session:

                session_serializer = SimulationSessionSerializer(existing_session)
                return Response(session_serializer.data, status=status.HTTP_200_OK)


            case = ClinicalCase.objects.get(id=case_id)
            session = SimulationSession.objects.create(
                apprenant=request.user,
                case=case
            )

            #
            session_serializer = SimulationSessionSerializer(session)
            return Response(session_serializer.data, status=status.HTTP_201_CREATED)


class SimulationViewSet(viewsets.GenericViewSet):
    """
    Un ViewSet pour gérer toutes les actions liées à une session de simulation.
    Regroupe les actions : lister, démarrer, consulter, et dialoguer.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Cette méthode garantit que toutes les opérations de ce ViewSet
        s'appliquent uniquement aux sessions de l'utilisateur actuellement connecté.
        """
        return SimulationSession.objects.filter(apprenant=self.request.user)

    def list(self, request):
        """
        Liste toutes les sessions de simulation de l'utilisateur connecté.
        Accessible via : GET /api/simulations/
        """
        queryset = self.get_queryset().order_by('-start_time')
        serializer = SimulationSessionSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Récupère les détails d'une session de simulation spécifique.
        Accessible via : GET /api/simulations/{pk}/
        """
        try:
            session = self.get_queryset().get(pk=pk)
            serializer = SimulationSessionSerializer(session)
            return Response(serializer.data)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], serializer_class=StartSimulationSerializer, url_path='start')
    def start_session(self, request):
        """
        Démarre une nouvelle session de simulation pour un cas donné.
        Accessible via : POST /api/simulations/start/
        """
        serializer = StartSimulationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case_id = serializer.validated_data['case_id']


        session, created = SimulationSession.objects.get_or_create(
            apprenant=request.user,
            case_id=case_id,
            status=SimulationSession.Status.IN_PROGRESS,
            defaults={'case_id': case_id, 'apprenant': request.user}
        )

        response_serializer = SimulationSessionSerializer(session)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(response_serializer.data, status=response_status)

    @action(detail=True, methods=['post'], serializer_class=ChatMessageSerializer, url_path='message')
    def post_message(self, request, pk=None):
        """
        Poste un nouveau message dans une session existante (identifiée par pk)
        et retourne la réponse de l'agent IA.
        Accessible via : POST /api/simulations/{pk}/message/
        """
        try:
            session = self.get_queryset().get(pk=pk)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

        user_message_content = request.data.get('content')
        if not user_message_content:
            return Response({"error": "Le champ 'content' est requis."}, status=status.HTTP_400_BAD_REQUEST)

        ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.APPRENANT,
            content=user_message_content
        )

        try:
            agent = PatientSimulatorAgent(case=session.case, session_id=session.id)
            ai_response_content = agent.generate_response(user_message=user_message_content)
        except Exception as e:

            print(f"Erreur Agent IA: {e}")
            return Response({"error": "Une erreur est survenue lors de la génération de la réponse de l'IA."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        ai_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.PATIENT_IA,
            content=ai_response_content
        )

        response_serializer = ChatMessageSerializer(ai_message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)