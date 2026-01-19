import io

from django.core.management import call_command
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend

# backend/cases/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filter import ClinicalCaseFilter
from .models import ClinicalCase, Specialty
from .serializers import ClinicalCaseListSerializer, ClinicalCaseDetailSerializer, SpecialtySerializer


class ClinicalCaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]
    filterset_class = ClinicalCaseFilter

    def get_serializer_class(self):
        if self.action == 'list':
            return ClinicalCaseListSerializer
        return ClinicalCaseDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'EXPERT':
            return ClinicalCase.objects.all().order_by('-created_at')
        return ClinicalCase.objects.filter(status='approuve').order_by('-created_at')

    # --- ACTION : IMPORT MANUEL ---
    @action(detail=False, methods=['post'], url_path='trigger-import')
    def trigger_import(self, request):
        if request.user.profile.role != 'EXPERT':
            return Response({"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        # On utilise StringIO pour capturer ce que la commande "print" normalement
        out = io.StringIO()
        err = io.StringIO()

        try:
            # On appelle la commande 'import_cases'
            # On peut passer '--mock' si on est en dév via un paramètre de requête ?mock=true
            use_mock = request.query_params.get('mock') == 'true'
            options = {'mock': use_mock, 'stdout': out, 'stderr': err}

            call_command('import_cases', **options)

            output_msg = out.getvalue()

            if "nouveaux cas trouvés" in output_msg and "0 nouveaux cas" not in output_msg:
                return Response({"message": "Import terminé avec succès.", "details": output_msg},
                                status=status.HTTP_200_OK)
            else:
                # Feedback spécifique si rien de nouveau
                return Response(
                    {"message": "Aucun nouveau cas disponible sur Fultang pour le moment.", "details": output_msg},
                    status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e), "details": err.getvalue()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # --- ACTION : EXPORT DATASET ---
    @action(detail=False, methods=['post'], url_path='trigger-export')
    def trigger_export(self, request):
        if request.user.profile.role != 'EXPERT':
            return Response({"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        out = io.StringIO()
        try:
            # On lance l'export (par défaut jsonl et approuvé)
            call_command('export_dataset', stdout=out)
            return Response({"message": "Dataset généré et envoyé sur MinIO.", "details": out.getvalue()},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer