

from pydantic import BaseModel, Field

class EvaluationResult(BaseModel):
    relevance_score: int = Field(description="Note de 0 à 10 sur la pertinence diagnostique de la question.")
    empathy_score: int = Field(description="Note de 0 à 10 sur le ton et l'empathie (mettre 5 si neutre).")
    reasoning: str = Field(description="Analyse brève expliquant pourquoi cette note a été donnée.")
    pedagogical_feedback: str = Field(description="Une question socratique ou un indice court pour aider l'étudiant, si nécessaire.")