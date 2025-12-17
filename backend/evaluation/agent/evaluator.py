from django.conf import settings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_groq import ChatGroq

from cases.models import ClinicalCase
from evaluation.schemas.evaluator_schemas import EvaluationResult


class TutorEvaluatorAgent:
    """
    Agent pédagogique qui observe la simulation et évalue l'apprenant en temps réel.
    """

    def __init__(self, case: ClinicalCase):
        self.case = case

        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,  # Évaluation stricte
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=EvaluationResult)

    def evaluate_exchange(self, user_message: str, chat_history_str: str) -> dict:
        """
        Analyse la dernière question de l'apprenant par rapport au contexte du cas.
        """

        # Le Prompt Pédagogique (Socratique + Étayage)
        prompt_template = """
                Tu es un Mentor Socratique expert en médecine.
                Ta mission n'est PAS de donner les réponses, mais de forcer l'étudiant à réfléchir par lui-même.

                CONTEXTE DU CAS :
                - Diagnostic Final : {diagnoses}
                - Questions clés attendues : {key_questions}

                HISTORIQUE RÉCENT :
                {chat_history}

                DERNIÈRE QUESTION DE L'ÉTUDIANT :
                "{user_message}"

                CONSIGNES STRICTES POUR LE FEEDBACK :
                1. **Analyse la pertinence (0-10)** : La question est-elle utile pour le diagnostic ?
                2. **Génération du Feedback (pedagogical_feedback)** :
                   - SI LE SCORE EST BAS (< 6) : Tu dois formuler une **QUESTION SOCRATIQUE**.
                   - **INTERDIT** : Ne donne jamais la réponse. Ne dis jamais "Tu devrais demander X". Ne dis jamais "Concentre-toi sur Y".
                   - **OBLIGATOIRE** : Pose une question qui met en lumière la lacune de l'étudiant.
                   - *Exemple mauvais* : "Demande-lui s'il a de la fièvre."
                   - *Exemple Socratique (Bon)* : "Pourquoi écartes-tu l'hypothèse infectieuse à ce stade ?" ou "Quel lien fais-tu entre ce détail et la douleur thoracique ?"

                {format_instructions}
                """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        key_questions_val = self.case.key_questions if self.case.key_questions else []
        key_questions_str = ", ".join(key_questions_val) if isinstance(key_questions_val, list) else str(
            key_questions_val)

        # 2. Préparation des Diagnostics (C'est ce qui manquait !)
        # On récupère tous les diagnostics liés au cas via la relation inverse
        diagnoses_objs = self.case.diagnoses.all()
        if diagnoses_objs:
            # On crée une chaîne : "Grippe (Final: Non), Covid (Final: Oui)"
            diagnoses_str = ", ".join(
                [f"{d.description} (Final: {'Oui' if d.is_final else 'Non'})" for d in diagnoses_objs])
        else:
            diagnoses_str = "Diagnostic non défini dans la base."

        # Exécution de la chaîne
        chain = prompt | self.llm | self.parser

        try:
            result = chain.invoke({
                "case_title": self.case.case_title,
                "case_summary": self.case.case_summary or "",  # Gestion du None
                "diagnoses": diagnoses_str,  # <--- ON PASSE LA VARIABLE MANQUANTE ICI
                "key_questions": key_questions_str,
                "chat_history": chat_history_str,
                "user_message": user_message
            })
            return result
        except Exception as e:
            print(f"Erreur lors de l'évaluation : {e}")
            return None