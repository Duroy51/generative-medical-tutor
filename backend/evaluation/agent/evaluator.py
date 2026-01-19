from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from django.conf import settings
from cases.models import ClinicalCase
from evaluation.schemas.evaluator_schemas import EvaluationResult


class TutorEvaluatorAgent:
    """
    Agent pédagogique avancé (Niveau Expert).
    Il évalue le RAISONNEMENT CLINIQUE et non plus seulement la conformité à une liste.
    """

    def __init__(self, case: ClinicalCase):
        self.case = case
        # On utilise le modèle 70b pour une meilleure capacité de raisonnement médical
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=EvaluationResult)

    def _format_full_context(self):
        """
        Construit une représentation textuelle complète de la 'Vérité Terrain'.
        Le tuteur doit tout savoir pour juger si une question est pertinente.
        """
        c = self.case

        # Formatage des listes pour le prompt
        symptoms = ", ".join([f"{s.nom} ({s.localisation or ''})" for s in c.symptoms.all()])
        history = ", ".join([f"{h.type}: {h.description}" for h in c.history_entries.all()])
        treatments = ", ".join([f"{t.nom}" for t in c.current_treatments.all()])

        # Diagnostics : On distingue le final des différentiels
        final_diag = ""
        diff_diags = []
        for d in c.diagnoses.all():
            if d.is_final:
                final_diag = d.description
            else:
                diff_diags.append(d.description)

        diff_diags_str = ", ".join(diff_diags) if diff_diags else "Aucun spécifique"

        return f"""
        --- DOSSIER MÉDICAL COMPLET (VÉRITÉ TERRAIN) ---
        TITRE : {c.case_title}
        RÉSUMÉ : {c.case_summary}

        SYMPTÔMES DU PATIENT : {symptoms}
        ANTÉCÉDENTS : {history}
        TRAITEMENTS EN COURS : {treatments}

        DIAGNOSTIC FINAL (CIBLE) : {final_diag}
        DIAGNOSTICS DIFFÉRENTIELS (PISTES À ÉCARTER) : {diff_diags_str}

        QUESTIONS CLÉS IDÉALES : {c.key_questions}
        PIÈGES COURANTS : {c.common_pitfalls}
        ------------------------------------------------
        """

    def evaluate_exchange(self, user_message: str, chat_history_str: str) -> dict:
        """
        Analyse la pertinence médicale de la question.
        """

        full_context = self._format_full_context()

        # LE PROMPT "CERVEAU MÉDICAL"
        prompt_template = """
        Tu es un Professeur de Médecine Senior et Mentor Socratique.
        Ta mission est d'évaluer la pertinence clinique de la dernière question posée par un étudiant en médecine.

        {full_context}

        HISTORIQUE DE LA CONVERSATION :
        {chat_history}

        DERNIÈRE QUESTION DE L'ÉTUDIANT :
        "{user_message}"

        --- GUIDE D'ÉVALUATION AVANCÉ ---

        Ne te base pas uniquement sur la liste des "Questions Clés Idéales". Utilise ton jugement médical.
        Une question est PERTINENTE (Score > 6) si :
        1. **Cible le Diagnostic Final :** Elle cherche un symptôme clé de la maladie réelle du patient.
        2. **Élimine un Diagnostic Différentiel :** Elle vérifie une autre hypothèse logique (ex: demander "Avez-vous mal au bras ?" pour une douleur thoracique est pertinent pour écarter l'infarctus, même si c'est une embolie).
        3. **Sécurité :** Elle vérifie les allergies, les traitements en cours ou les constantes vitales.
        4. **Clarification :** Elle précise une information vague donnée par le patient (durée, intensité).
        5. **Politesse :** "Bonjour" ou se présenter est une bonne pratique (Score 8-10, pas de feedback correctif).

        Une question est FAIBLE (Score < 4) si :
        1. **Hors-Sujet total :** Aucun lien physiologique avec les symptômes présentés.
        2. **Redondante :** L'information a DÉJÀ été donnée clairement dans l'historique ci-dessus.
        3. **Prématurée/Illogique :** Conclure ou prescrire sans avoir assez d'infos.

        --- RÈGLES DE FEEDBACK (Socratique) ---
        - Si Score < 4 (Faible) : Interviens avec une QUESTION qui pousse à la réflexion. Ne donne jamais la réponse.
          Ex: "Le patient se plaint du ventre, pourquoi explorez-vous les réflexes maintenant ?"
        - Si Score >= 4 : Laisse l'étudiant avancer (feedback vide).

        Génère la réponse au format JSON strict.

        {format_instructions}
        """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        chain = prompt | self.llm | self.parser

        try:
            result = chain.invoke({
                "full_context": full_context,
                "chat_history": chat_history_str,
                "user_message": user_message
            })
            return result
        except Exception as e:
            print(f"Erreur lors de l'évaluation : {e}")
            return None