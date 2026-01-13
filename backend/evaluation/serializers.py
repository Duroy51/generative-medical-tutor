from rest_framework import serializers
from .models import FinalReport

class FinalReportSerializer(serializers.ModelSerializer):
    case_id = serializers.IntegerField(source='session.case.id', read_only=True)
    class Meta:
        model = FinalReport
        fields = '__all__'