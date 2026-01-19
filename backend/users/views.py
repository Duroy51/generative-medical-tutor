
from django.contrib.auth.models import User
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from cases.models import ClinicalCase
from simulation.models import SimulationSession
from .permissions import IsSystemAdmin
from .serializers import UserRegisterSerializer, MyTokenObtainPairSerializer, UserDetailSerializer, \
    UserCreateExpertSerializer, UserAdminSerializer


class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserMeView(generics.RetrieveAPIView):
    """
    Endpoint pour récupérer les informations de l'utilisateur connecté.
    GET /api/users/me/
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    API de gestion complète des utilisateurs.
    Accessible uniquement aux ADMINS.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserAdminSerializer
    permission_classes = [IsSystemAdmin]

    # Action pour créer un expert
    @action(detail=False, methods=['post'], serializer_class=UserCreateExpertSerializer)
    def create_expert(self, request):
        serializer = UserCreateExpertSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Compte Expert créé avec succès"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        # On inverse le statut
        user.is_active = not user.is_active
        user.save()
        status_msg = "activé" if user.is_active else "désactivé"
        return Response({"message": f"Utilisateur {user.username} {status_msg}."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password')

        if not new_password or len(new_password) < 6:
            return Response({"error": "Mot de passe trop court ou manquant."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Mot de passe réinitialisé avec succès."}, status=status.HTTP_200_OK)

    
    # Action pour les statistiques globales du dashboard
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_users = User.objects.count()
        total_experts = User.objects.filter(profile__role='EXPERT').count()
        total_students = User.objects.filter(profile__role='APPRENANT').count()
        total_cases = ClinicalCase.objects.count()
        total_sessions = SimulationSession.objects.count()

        return Response({
            "users": {
                "total": total_users,
                "experts": total_experts,
                "students": total_students
            },
            "content": {
                "cases": total_cases
            },
            "activity": {
                "sessions": total_sessions
            }
        })