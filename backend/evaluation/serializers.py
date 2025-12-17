from rest_framework import serializers
from .models import FinalReport

class FinalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalReport
        fields = '__all__'