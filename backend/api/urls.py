
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from cases.views import ClinicalCaseViewSet
from simulation.views import SimulationViewSet


router = DefaultRouter()


router.register(r'cases', ClinicalCaseViewSet, basename='case')
router.register(r'simulations', SimulationViewSet, basename='simulation')


urlpatterns = [

    path('', include(router.urls)),

    path('users/', include('users.urls')),
]