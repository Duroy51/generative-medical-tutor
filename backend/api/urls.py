# backend/api/urls.py
from django.urls import path, include

urlpatterns = [
    path('users/', include('users.urls')),
    path('', include('cases.urls')),
]