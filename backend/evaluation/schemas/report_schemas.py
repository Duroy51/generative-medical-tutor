from pydantic import BaseModel, Field
from typing import List, Dict


class FinalReportStructure(BaseModel):
    score_global: int = Field(
        description="Note globale sur 100 évaluant la performance médicale et communicationnelle.")
    diagnostic_found: bool = Field(description="Vrai si l'étudiant a explicitement formulé le bon diagnostic à la fin.")

    strengths: List[str] = Field(
        description="Liste de 3 points forts observés (ex: 'Bonne empathie', 'Anamnèse structurée').")
    improvements: List[str] = Field(description="Liste de 3 axes d'amélioration précis.")

    detailed_analysis: str = Field(
        description="Un paragraphe de synthèse bienveillant mais rigoureux, s'adressant directement à l'étudiant ('Vous avez...').")

    key_questions_checklist: Dict[str, bool] = Field(
        description="Un dictionnaire listant chaque 'Question Clé' attendue du cas, avec 'true' si l'étudiant l'a posée (ou un équivalent), et 'false' sinon."
    )