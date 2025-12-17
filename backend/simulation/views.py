# backend/simulation/views.py
import random

from django.utils import timezone
from rest_framework import generics, status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from evaluation.agent.summarizer import SessionSummarizerAgent
from .models import SimulationSession, ChatMessage
from .serializers import ChatMessageSerializer, StartSimulationSerializer, SimulationSessionSerializer
from cases.models import ClinicalCase
from evaluation.agent.evaluator import TutorEvaluatorAgent
from evaluation.models import EvaluationLog
from evaluation.serializers import FinalReportSerializer
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


class SimulationViewSet(mixins.CreateModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.ListModelMixin,
                        mixins.DestroyModelMixin, # <--- AJOUTER CE MIXIN (Permet le DELETE)
                        viewsets.GenericViewSet):
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
        case_id = serializer.validated_data.get('case_id')
        force_new = serializer.validated_data.get('force_new', False)

        # LOGIQUE ALÉATOIRE
        if not case_id:
            # On cherche tous les IDs des cas approuvés
            approved_case_ids = list(ClinicalCase.objects.filter(status='approuve').values_list('id', flat=True))

            if not approved_case_ids:
                return Response({"error": "Aucun cas clinique disponible pour le moment."},
                                status=status.HTTP_404_NOT_FOUND)

            # On en choisit un au hasard
            case_id = random.choice(approved_case_ids)

        existing_session = SimulationSession.objects.filter(
            apprenant=request.user,
            case_id=case_id,
            status=SimulationSession.Status.IN_PROGRESS
        ).first()

        # 2. Si elle existe ET qu'on n'a pas forcé une nouvelle : on la renvoie (200 OK)
        if existing_session and not force_new:
            return Response(SimulationSessionSerializer(existing_session).data, status=status.HTTP_200_OK)

        # 3. Sinon (pas de session OU force_new=True), on crée une nouvelle (201 Created)
        new_session = SimulationSession.objects.create(
            apprenant=request.user,
            case_id=case_id,
            status=SimulationSession.Status.IN_PROGRESS
        )

        return Response(SimulationSessionSerializer(new_session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='finish')
    def finish_session(self, request, pk=None):
        print(f"--- DÉBUT CLÔTURE SESSION {pk} ---")
        try:
            session = self.get_queryset().get(pk=pk)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if session.status == SimulationSession.Status.COMPLETED and hasattr(session, 'report'):
            return Response({"report_id": session.report.id}, status=status.HTTP_200_OK)

        # 1. Clôture
        session.status = SimulationSession.Status.COMPLETED
        session.end_time = timezone.now()
        session.save()

        # 2. Génération rapport
        try:
            summarizer = SessionSummarizerAgent(session)
            report = summarizer.generate_report()
            print(f"--- RAPPORT GÉNÉRÉ. SCORE: {report.score_global} ---")

            # --- 3. MISE À JOUR DU PROFIL (KNOWLEDGE TRACING) ---
            user_profile = request.user.profile
            case_categories = session.case.categories.all()

            print(f"--- CATÉGORIES DU CAS : {[c.name for c in case_categories]} ---")

            if not case_categories:
                print("⚠️ ATTENTION : Ce cas n'a aucune catégorie ! Le profil ne sera pas mis à jour.")

            current_matrix = user_profile.skill_matrix or {}

            for category in case_categories:
                cat_name = category.name
                cat_data = current_matrix.get(cat_name, {"level": 0, "sessions": 0})

                # Calcul moyenne pondérée
                current_level = cat_data["level"]
                sessions_count = cat_data["sessions"]
                new_session_score = report.score_global

                new_level = ((current_level * sessions_count) + new_session_score) / (sessions_count + 1)

                current_matrix[cat_name] = {
                    "level": round(new_level, 1),
                    "sessions": sessions_count + 1
                }
                print(f"--- MISE À JOUR {cat_name} : {current_level} -> {new_level} ---")

            user_profile.skill_matrix = current_matrix
            user_profile.save()
            # ----------------------------------------------------

            return Response({"report_id": report.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"ERREUR CRITIQUE FINISH : {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": "Erreur serveur"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




    @action(detail=True, methods=['get'], url_path='results')
    def get_results(self, request, pk=None):
        """
        Récupère le rapport final d'une session terminée.
        URL : GET /api/simulations/{id}/results/
        """
        session = self.get_object()

        # Vérifier si un rapport existe
        if not hasattr(session, 'report'):
            return Response({"error": "Le rapport n'est pas encore généré pour cette session."},
                            status=status.HTTP_404_NOT_FOUND)

        # Sérialiser et renvoyer le rapport
        serializer = FinalReportSerializer(session.report)
        return Response(serializer.data)


    @action(detail=True, methods=['post'], serializer_class=ChatMessageSerializer, url_path='message')
    def post_message(self, request, pk=None):
        """
        Gère l'envoi d'un message par l'apprenant, la réponse du patient,
        et l'intervention éventuelle du tuteur socratique.
        """
        # 1. Récupération et vérification de la session
        try:
            session = self.get_queryset().get(pk=pk)
        except SimulationSession.DoesNotExist:
            return Response({"error": "Session non trouvée ou non autorisée."}, status=status.HTTP_404_NOT_FOUND)

        # 2. Validation du message utilisateur
        user_message_content = request.data.get('content')
        if not user_message_content:
            return Response({"error": "Le champ 'content' est requis."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Sauvegarde du message de l'apprenant
        user_message_obj = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.APPRENANT,
            content=user_message_content
        )

        # 4. Génération de la réponse du PATIENT (Agent Simulateur)
        try:
            agent = PatientSimulatorAgent(case=session.case, session_id=session.id)
            ai_response_content = agent.generate_response(user_message=user_message_content)
        except Exception as e:
            print(f"Erreur Agent Patient: {e}")
            return Response({"error": "Erreur lors de la génération de la réponse du patient."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        ai_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.PATIENT_IA,
            content=ai_response_content
        )

        # 5. Processus du TUTEUR (Agent Évaluateur)
        # Ce bloc est isolé dans un try/except pour ne jamais bloquer la conversation principale
        try:
            # A. Préparation du contexte pour l'évaluateur
            # On récupère l'historique jusqu'au message de l'utilisateur (sans la réponse du patient qui vient d'être créée)
            history_qs = ChatMessage.objects.filter(session=session).exclude(id=ai_message.id).order_by('timestamp')
            history_str = "\n".join([f"{m.get_sender_display()}: {m.content}" for m in history_qs])

            # Force le rechargement des données du cas (notamment key_questions)
            session.case.refresh_from_db()

            # B. Analyse par l'IA Tuteur
            evaluator = TutorEvaluatorAgent(case=session.case)
            eval_result = evaluator.evaluate_exchange(
                user_message=user_message_content,
                chat_history_str=history_str
            )

            if eval_result:
                # C. Sauvegarde du Log technique (pour les statistiques)
                EvaluationLog.objects.create(
                    message=user_message_obj,
                    relevance_score=eval_result.get('relevance_score', 5),
                    empathy_score=eval_result.get('empathy_score', 5),
                    reasoning=eval_result.get('reasoning', ''),
                    pedagogical_feedback=eval_result.get('pedagogical_feedback', '')
                )

                # D. Logique d'Intervention SOCRATIQUE
                # Si la pertinence est faible (< 6) ET qu'un feedback existe
                score = eval_result.get('relevance_score', 10)
                feedback = eval_result.get('pedagogical_feedback', '')

                if score < 6 and feedback:
                    # Le Tuteur intervient dans le chat avec une question guidante
                    ChatMessage.objects.create(
                        session=session,
                        sender=ChatMessage.Sender.TUTEUR,
                        content=f"🤔 Question du Mentor : {feedback}"
                    )
                    print(f"--- INTERVENTION DU TUTEUR : {feedback} ---")

        except Exception as e:

            print(f"⚠️ Erreur non bloquante dans le module tuteur : {e}")
            import traceback
            traceback.print_exc()

        response_serializer = ChatMessageSerializer(ai_message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)