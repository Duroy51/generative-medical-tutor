
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from cases.views import ClinicalCaseViewSet, SpecialtyViewSet
from simulation.views import SimulationViewSet
from users.views import UserAdminViewSet

router = DefaultRouter()


router.register(r'cases', ClinicalCaseViewSet, basename='case')
router.register(r'simulations', SimulationViewSet, basename='simulation')
router.register(r'specialties', SpecialtyViewSet, basename='specialty')# <--- AJOUTEZ CECI
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')


urlpatterns = [

    path('', include(router.urls)),

    path('users/', include('users.urls')),
]