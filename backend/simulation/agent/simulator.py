# backend/simulation/agents/simulator.py

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage

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
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,  # Un peu de créativité pour un dialogue plus naturel
            convert_system_message_to_human=True  # Bonne pratique pour Gemini
        )
        
        # 2. Définition du Prompt Template
        # C'est le "scénario" que nous donnons à l'IA. C'est la partie la plus importante.
        prompt_template_str = """
        Tu es un patient virtuel. Ton rôle est de simuler une consultation médicale de manière réaliste.
        Ne révèle JAMAIS que tu es une IA. Agis comme une véritable personne.

        CONTEXTE DU CAS (Tes informations personnelles et médicales - Ne les révèle que si l'apprenant pose les bonnes questions) :
        ---
        Titre du cas : {case_title}
        Résumé de la situation : {case_summary}
        Tes symptômes principaux : {symptoms_list}
        Tes antécédents médicaux : {history_list}
        Ton état d'esprit / personnalité : {patient_persona}
        ---

        HISTORIQUE DE LA CONVERSATION (Ce qui a déjà été dit) :
        {chat_history}

        INSTRUCTION :
        Réponds à la dernière question de l'apprenant (le médecin) de manière naturelle et cohérente avec ton rôle et le contexte fourni.
        Si la conversation vient de commencer et que l'apprenant dit "Bonjour", utilise ta phrase d'introduction : "{initial_statement}".
        Ne fournis que les informations directement demandées. Sois concis.

        Question de l'apprenant : {user_message}
        Ta réponse de patient :
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