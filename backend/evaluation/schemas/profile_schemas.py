from pydantic import BaseModel, Field
from typing import List


class ProfileAnalysisStructure(BaseModel):
    strengths_detailed: List[str] = Field(
        description="Analyse détaillée des points forts récurrents (ex: 'Excellente empathie dans les cas graves').")
    weaknesses_detailed: List[str] = Field(
        description="Analyse détaillée des lacunes récurrentes (ex: 'Oublie souvent les allergies').")

    strategic_advice: List[str] = Field(
        description="3 à 5 actions concrètes et hyper-spécifiques pour s'améliorer (ex: 'Revoir le protocole de l'embolie').")

    estimated_level: str = Field(description="Niveau estimé global (Externe, Interne, Résident, Chef).")