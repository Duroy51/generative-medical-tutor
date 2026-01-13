

from pydantic import BaseModel, Field
from typing import List, Optional


class SymptomStructure(BaseModel):
    nom: str = Field(description="Nom du symptôme, tel que rapporté par le patient (ex: 'douleur thoracique').")
    localisation: Optional[str] = Field(description="Où le symptôme se manifeste (ex: 'rétrosternale').", default=None)
    date_debut: Optional[str] = Field(description="Quand le symptôme a commencé (ex: 'il y a 2 heures').", default=None)
    frequence: Optional[str] = Field(description="Fréquence du symptôme (ex: 'constante', 'intermittente').", default=None)
    duree: Optional[str] = Field(description="Durée de chaque épisode (ex: 'environ 15 minutes').", default=None)
    evolution: Optional[str] = Field(description="Comment le symptôme a évolué depuis son apparition.", default=None)
    activite_declenchante: Optional[str] = Field(description="Ce qui semble déclencher ou aggraver le symptôme (ex: 'à l'effort').", default=None)
    degre: Optional[int] = Field(description="Sévérité du symptôme sur une échelle de 1 à 10.", default=None)


class ExamStructure(BaseModel):
    nom: str = Field(description="Nom de l'examen")
    resultat: str = Field(description="Résultat complet")
    anatomie: Optional[str] = Field(description="Zone anatomique concernée (ex: Thorax, Abdomen)", default=None)


class HistoryEntryStructure(BaseModel):
    type: str = Field(description="Type précis: maladie, chirurgie, familial, allergie, obstetrical")
    # Champs communs
    nom: Optional[str] = Field(description="Nom de la pathologie ou de l'acte", default=None)
    description: str = Field(description="Résumé textuel complet (fallback)")

    # Spécifique Maladie/Chirurgie
    date: Optional[str] = Field(description="Date ou date de début", default=None)
    date_fin: Optional[str] = Field(description="Date de fin (si applicable)", default=None)
    observation: Optional[str] = Field(description="Observations supplémentaires", default=None)

    # Traitement lié (Sous-branche Maladie)
    traitement_nom: Optional[str] = Field(description="Nom du traitement lié à cette maladie", default=None)
    traitement_duree: Optional[str] = Field(description="Durée du traitement", default=None)
    traitement_posologie: Optional[str] = Field(description="Posologie du traitement", default=None)

    # Spécifique Allergie
    declencheur: Optional[str] = Field(description="Molécule ou facteur déclenchant", default=None)
    manifestation: Optional[str] = Field(description="Symptômes de l'allergie", default=None)

    # Spécifique Obstétrique
    nombre_grossesse: Optional[int] = Field(description="Nombre de grossesses (G)", default=None)
class TreatmentStructure(BaseModel):
    nom: str = Field(description="Nom du médicament ou du traitement en cours.")
    posologie: Optional[str] = Field(description="Dosage et fréquence du traitement (ex: '10mg, 1 fois par jour').", default=None)
    efficacite: Optional[str] = Field(description="Perception de l'efficacité du traitement par le patient.", default=None)


class PhysicalFindingStructure(BaseModel):
    nom_examen: str = Field(description="Partie de l'examen physique réalisée (ex: 'Auscultation cardiaque').")
    resultat_observation: str = Field(description="Observation ou résultat de cet examen (ex: 'Bruits du cœur réguliers, pas de souffle').")

class DiagnosisStructure(BaseModel):
    description: str = Field(description="Description du diagnostic (ex: 'Infarctus du myocarde antérieur').")
    is_final: bool = Field(description="Indique si c'est le diagnostic final confirmé pour ce cas.")

class GraphNodeStructure(BaseModel):
    id: str = Field(description="Identifiant unique court du nœud (ex: 'S1', 'D2')")
    label: str = Field(description="Le texte affiché (ex: 'Douleur thoracique', 'Infarctus')")
    type: str = Field(description="Le type de nœud : 'symptom', 'history', 'exam', 'diagnosis' ou 'hypothesis'")

class GraphEdgeStructure(BaseModel):
    source: str = Field(description="L'ID du nœud source")
    target: str = Field(description="L'ID du nœud cible")
    label: str = Field(description="La relation logique (ex: 'suggère', 'confirme', 'exclut', 'nécessite')")

class ReasoningGraphStructure(BaseModel):
    nodes: List[GraphNodeStructure] = Field(description="Liste des nœuds du graphe")
    edges: List[GraphEdgeStructure] = Field(description="Liste des liens logiques entre les nœuds")


class PedagogicalDataStructure(BaseModel):
    case_title: str = Field(description="Titre pédagogique NE RÉVÉLANT PAS le diagnostic. Ex: 'Douleur abdominale...' pas 'Appendicite'")
    categories: List[str] = Field(description="Liste des catégories médicales pertinentes pour ce cas.")
    difficulty: str = Field(description="Difficulté estimée du cas, choisir parmi: Facile, Moyen, Difficile.")
    learning_objectives: str = Field(description="Objectifs pédagogiques que l'apprenant doit atteindre.")
    key_questions_to_ask: List[str] = Field(description="Liste des 3 à 5 questions essentielles que l'apprenant doit poser.")
    common_pitfalls: str = Field(description="Description des erreurs de diagnostic ou de raisonnement courantes à éviter.")

class SimulationDataStructure(BaseModel):
    patient_persona: str = Field(description="Description de la personnalité du patient à simuler (ex: 'Anxieux et utilise des termes vagues').")
    initial_statement: str = Field(description="La phrase exacte que le patient doit dire pour commencer la consultation.")

class PatientInfoStructure(BaseModel):
    age: int = Field(description="Âge du patient en années.")
    sexe: str = Field(description="Sexe biologique du patient (Homme/Femme).")
    etat_civil: Optional[str] = Field(description="État civil du patient.", default=None)
    profession: Optional[str] = Field(description="Profession du patient.", default=None)

class ConsultationInfoStructure(BaseModel):
    motif_consultation: str = Field(description="Raison principale de la consultation, telle que formulée par le patient.")

class ClinicalDataStructure(BaseModel):
    patient_info: PatientInfoStructure
    consultation_info: ConsultationInfoStructure
    symptoms: List[SymptomStructure]
    history_entries: List[HistoryEntryStructure]
    current_treatments: List[TreatmentStructure]
    exams: List[ExamStructure]
    physical_findings: List[PhysicalFindingStructure]
    diagnoses: List[DiagnosisStructure]



class FullCaseStructure(BaseModel):
    pedagogical_data: PedagogicalDataStructure
    simulation_data: SimulationDataStructure
    clinical_data: ClinicalDataStructure
    reasoning_graph: ReasoningGraphStructure = Field(
        description="Graphe représentant le raisonnement clinique logique du cas.")