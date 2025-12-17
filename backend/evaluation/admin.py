
from django.contrib import admin
from .models import EvaluationLog


@admin.register(EvaluationLog)
class EvaluationLogAdmin(admin.ModelAdmin):

    list_display = ('id', 'get_message_content', 'relevance_score', 'empathy_score', 'created_at')

    list_filter = ('relevance_score', 'created_at')

    readonly_fields = ('message', 'relevance_score', 'empathy_score', 'reasoning', 'pedagogical_feedback')

    def get_message_content(self, obj):
        return obj.message.content[:50] + "..." if obj.message else "N/A"

    get_message_content.short_description = "Message de l'Apprenant"