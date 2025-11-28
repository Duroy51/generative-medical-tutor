# backend/simulation/urls.py

from rest_framework.routers import DefaultRouter
from .views import SimulationViewSet

router = DefaultRouter()
router.register(r'simulations', SimulationViewSet, basename='simulation')

urlpatterns = router.urls