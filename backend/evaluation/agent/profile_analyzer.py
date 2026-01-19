from django.conf import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from evaluation.schemas.profile_schemas import ProfileAnalysisStructure
from evaluation.models import FinalReport


class ProfileAnalyzerAgent:
    def __init__(self, user):
        self.user = user
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.2,  # Créatif mais structuré
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=ProfileAnalysisStructure)

    def analyze_progression(self):
        # 1. Récupérer les 10 derniers rapports de l'étudiant
        # (On remonte depuis les sessions)
        reports = FinalReport.objects.filter(session__apprenant=self.user).order_by('-created_at')[:10]

        if not reports:
            return None

        # 2. Construire le contexte (L'historique des performances)
        history_context = ""
        for rep in reports:
            case = rep.session.case
            history_context += f"""
            - Cas : {case.case_title} ({case.difficulty})
              Score : {rep.score_global}/100. Diagnostic trouvé : {rep.diagnostic_found}.
              Points faibles notés ce jour-là : {", ".join(rep.feedback_improvements)}
            """

        # 3. Prompt "Coach de Carrière"
        prompt_template = """
        Tu es le Directeur de l'École de Médecine. Tu suis la carrière d'un étudiant.
        Ton but est de fournir une analyse macroscopique de sa progression et des conseils ultra-personnalisés.

        --- HISTORIQUE DES DERNIÈRES SIMULATIONS ---
        {history}

        --- TA MISSION ---
        Ne juge pas un seul cas. Cherche des PATTERNS (Habitudes) récurrents.
        1. **Forces :** Qu'est-ce qu'il réussit tout le temps ? (ex: "Toujours bon en diagnostic, même difficile").
        2. **Faiblesses :** Quelle est son erreur chronique ? (ex: "Néglige systématiquement les antécédents", "Panique sur les urgences").
        3. **Conseils :** Donne des tâches précises. Pas "Révise la cardio", mais "Révise les diagnostics différentiels de la douleur thoracique car tu as raté l'embolie 2 fois".

        Génère l'analyse au format JSON.

        {format_instructions}
        """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        chain = prompt | self.llm | self.parser

        try:
            return chain.invoke({"history": history_context})
        except Exception as e:
            print(f"Erreur ProfileAnalyzer : {e}")
            return None