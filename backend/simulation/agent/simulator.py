# backend/simulation/agents/simulator.py
from django.conf import settings

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq

from cases.models import ClinicalCase
from simulation.models import ChatMessage


class PatientSimulatorAgent:
    """
    Agent chargé de générer les réponses du patient simulé en utilisant LangChain.
    Il est initialisé pour un cas clinique et une session de simulation spécifiques.
    """

    def __init__(self, case: ClinicalCase, session_id: int):
        """
        Initialise l'agent avec le cas clinique à simuler et l'ID de la session.
        """
        self.case = case
        self.session_id = session_id

        # 1. Initialisation du Modèle LLM (Gemini via LangChain)
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,  # Plus créatif pour la conversation
            api_key=settings.GROQ_API_KEY
        )

        # 2. Définition du Prompt Template
        # C'est le "scénario" que nous donnons à l'IA. C'est la partie la plus importante.
        # Nouveau Prompt optimisé pour les Actions Cliniques
        prompt_template_str = """
                Tu es une IA simulant un cas médical pour la formation d'un étudiant en médecine.
                Tu dois gérer deux rôles distincts selon l'entrée de l'utilisateur.

                CONTEXTE DU CAS (Vérité Terrain) :
                ---
                Titre : {case_title}
                Résumé : {case_summary}
                Symptômes réels : {symptoms_list}
                Antécédents : {history_list}
                Personnalité du patient : {patient_persona}
                ---

                HISTORIQUE :
                {chat_history}

                DERNIÈRE ENTRÉE DE L'UTILISATEUR :
                "{user_message}"

                --- INSTRUCTIONS DE RÉPONSE ---

                CAS 1 : L'utilisateur pose une question (Dialogue standard).
                - RÔLE : Tu es le PATIENT.
                - TON : Naturel, non médical, subjectif. Tu exprimes ce que tu ressens.
                - EXEMPLE : "J'ai mal au ventre." (Pas "Douleur épigastrique").
                - Si la question n'a pas de sens pour un patient, exprime ton incompréhension.

                CAS 2 : L'utilisateur effectue une ACTION CLINIQUE (L'entrée commence par "[ACTION]").
                - RÔLE : Tu es le SYSTÈME/LE CORPS.
                - TON : Clinique, objectif, précis, "Telegraphic style".
                - TÂCHE : Décris le résultat de l'examen demandé en te basant sur les données du cas.
                - DÉDUCTION : Si une donnée n'est pas explicite dans le résumé ci-dessus (ex: Température), DÉDUIS-LA logiquement du contexte clinique (ex: Si infection -> Fièvre probable / Si cas bénin -> Constantes normales).
                - FORMAT : Ne fais pas de phrases complètes. Donne juste le résultat.
                - EXEMPLE Entrée : "[ACTION] Constantes Vitales > Prise de Tension"
                - EXEMPLE Sortie : "TA : 135/85 mmHg. Asymétrie non notée."
                - EXEMPLE Entrée : "[ACTION] Auscultation > Pulmonaire"
                - EXEMPLE Sortie : "Murmure vésiculaire perçu. Pas de râles crépitants."

                TA RÉPONSE :
                """
        self.prompt = ChatPromptTemplate.from_template(prompt_template_str)

        # 3. Création de la chaîne LangChain (LCEL)
        # C'est l'assemblage : le prompt est envoyé au LLM.
        self.chain = self.prompt | self.llm

    def _get_chat_history_messages(self):
        """
        Récupère l'historique de la conversation depuis la base de données
        et le formate pour LangChain (HumanMessage, AIMessage).
        C'est notre "mémoire" basée sur la BDD.
        """
        messages = ChatMessage.objects.filter(session_id=self.session_id).order_by('timestamp')
        history = []
        for msg in messages:
            if msg.sender == ChatMessage.Sender.APPRENANT:
                history.append(HumanMessage(content=msg.content))
            else:  # C'est une réponse de l'IA (le patient)
                history.append(AIMessage(content=msg.content))
        return history

    def generate_response(self, user_message: str) -> str:
        """
        La méthode principale qui génère la réponse du patient.
        """
        # Formater les données du cas pour les injecter dans le prompt
        symptoms_str = ", ".join([s.nom for s in self.case.symptoms.all()])
        history_str = ", ".join([h.description for h in self.case.history_entries.all()])

        # Récupérer l'historique de la conversation depuis la BDD
        chat_history = self._get_chat_history_messages()

        # Invoquer la chaîne LangChain avec toutes les variables nécessaires
        response = self.chain.invoke({
            "case_title": self.case.case_title,
            "case_summary": self.case.case_summary or "",
            "symptoms_list": symptoms_str or "Aucun",
            "history_list": history_str or "Aucun",
            "patient_persona": "Normal",  # TODO: Utiliser self.case.patient_persona une fois ajouté
            "initial_statement": "Bonjour docteur, je ne me sens pas très bien.",
            # TODO: Utiliser self.case.initial_statement
            "chat_history": chat_history,
            "user_message": user_message
        })

        return response.content.strip()