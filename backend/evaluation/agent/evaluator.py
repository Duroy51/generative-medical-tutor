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



    def _get_full_clinical_context(self):
        """Récupère toutes les données du cas pour donner la vérité terrain au Tuteur."""
        c = self.case


        context = f"""
        --- VÉRITÉ TERRAIN DU PATIENT (DOSSIER COMPLET) ---
        TITRE : {c.case_title}
        RÉSUMÉ : {c.case_summary}

        SYMPTÔMES RÉELS :
        {", ".join([f"- {s.nom} ({s.localisation or ''}, {s.degre or ''}/10)" for s in c.symptoms.all()])}

        ANTÉCÉDENTS :
        {", ".join([f"- {h.type}: {h.description}" for h in c.history_entries.all()])}

        TRAITEMENTS EN COURS :
        {", ".join([f"- {t.nom}" for t in c.current_treatments.all()])}

        DIAGNOSTICS (Le final est le but) :
        {", ".join([f"- {d.description} {'(CIBLE FINALE)' if d.is_final else '(Différentiel)'}" for d in c.diagnoses.all()])}

        QUESTIONS CLÉS ATTENDUES (Le chemin idéal) :
        {self.case.key_questions}
        ---------------------------------------------------
        """
        return context


    def evaluate_exchange(self, user_message: str, chat_history_str: str) -> dict:
        """
        Analyse la dernière question de l'apprenant par rapport au contexte du cas.
        """

        full_context_str = self._get_full_clinical_context()
        # Le Prompt Pédagogique (Socratique + Étayage)
        prompt_template = """
                Tu es un Mentor Clinique expert.
                Tu dois évaluer la pertinence de la question de l'étudiant en fonction du DOSSIER COMPLET du patient.

                {full_context}

                HISTORIQUE DE LA CONVERSATION :
                {chat_history}

                DERNIÈRE QUESTION DE L'ÉTUDIANT :
                "{user_message}"

                --- TA MISSION D'ANALYSE ---
                1. Comprends l'INTENTION de l'étudiant. Cherche-t-il un symptôme ? Teste-t-il une hypothèse (même fausse mais logique) ?
                2. Compare cela aux données du dossier.
                   - Si la question explore une piste pertinente (même un diagnostic différentiel), c'est BON.
                   - Si la question est totalement illogique par rapport aux symptômes (ex: demander mal au pied pour une migraine), c'est MAUVAIS.
                   - Si la question est une répétition inutile, c'est MAUVAIS.

                --- RÈGLES D'INTERVENTION ---
                - N'interviens (note < 4 + feedback) QUE si l'étudiant est perdu ou dangereux.
                - S'il explore une piste secondaire logique, laisse-le faire (Note > 6).
                - S'il essaie juste d'etre poli avec le Patient, tu le laisse engagement faire.
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
                "full_context": full_context_str,
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