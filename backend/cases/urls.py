# backend/cases/urls.py
from rest_framework.routers import DefaultRouter
from .views import ClinicalCaseViewSet

router = DefaultRouter()
router.register(r'cases', ClinicalCaseViewSet, basename='case')

urlpatterns = router.urls