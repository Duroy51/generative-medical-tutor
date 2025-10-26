# backend/api/urls.py
from django.urls import path, include

urlpatterns = [
    path('', include('cases.urls')),
    # Nous ajouterons les URLs de simulation et d'évaluation ici plus tard
]