from django.conf import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from simulation.models import SimulationSession, ChatMessage
from evaluation.models import FinalReport, EvaluationLog
from evaluation.schemas.report_schemas import FinalReportStructure


class SessionSummarizerAgent:
    def __init__(self, session: SimulationSession):
        self.session = session
        self.case = session.case

        # On utilise le modèle le plus intelligent pour l'analyse finale
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,  # Très analytique
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=FinalReportStructure)

    def _get_context_data(self):
        """Prépare toutes les données textuelles pour le prompt."""

        # 1. La conversation
        messages = ChatMessage.objects.filter(session=self.session).order_by('timestamp')
        transcript = ""
        for msg in messages:
            sender = "ÉTUDIANT" if msg.sender == 'APPRENANT' else "PATIENT/SYSTÈME"
            if msg.sender == 'TUTEUR': continue  # On ignore les interventions du tuteur pour l'analyse finale de l'étudiant
            transcript += f"{sender}: {msg.content}\n"

        # 2. Les notes prises par l'Agent Évaluateur en temps réel (précieux !)
        eval_logs = EvaluationLog.objects.filter(message__session=self.session)
        eval_summary = ""
        for log in eval_logs:
            eval_summary += f"- Sur la question '{log.message.content}': Score Pertinence {log.relevance_score}/10. Note: {log.reasoning}\n"

        # 3. Les attentes du cas
        key_questions = self.case.key_questions if self.case.key_questions else []
        key_questions_str = ", ".join(key_questions) if isinstance(key_questions, list) else str(key_questions)

        # Récupération des diagnostics
        diagnoses_objs = self.case.diagnoses.all()
        final_diagnosis = next((d.description for d in diagnoses_objs if d.is_final), "Non défini")

        return {
            "transcript": transcript,
            "eval_notes": eval_summary,
            "case_title": self.case.case_title,
            "final_diagnosis": final_diagnosis,
            "key_questions": key_questions_str
        }

    def generate_report(self) -> FinalReport:
        context = self._get_context_data()

        prompt_template = """
        Tu es un Professeur de Médecine Senior chargé d'évaluer l'examen clinique d'un étudiant.
        Tu dois rédiger le rapport final de la simulation.

        --- CONTEXTE DU CAS (VÉRITÉ) ---
        Cas : {case_title}
        Diagnostic Final Attendu : {final_diagnosis}
        Questions Clés Attendues : {key_questions}

        --- TRANSCRIPTION DE LA CONSULTATION ---
        {transcript}

        --- NOTES D'ÉVALUATION CONTINUES (PRISES PENDANT LA SÉANCE) ---
        {eval_notes}

        --- TA MISSION ---
        Analyse la performance globale de l'étudiant.
        1. A-t-il trouvé le bon diagnostic ? (Regarde la fin de la conversation).
        2. A-t-il posé les questions clés ? (Remplis la checklist).
        3. A-t-il été professionnel ?

        Génère un rapport JSON strict selon le format demandé.
        Soyez juste mais exigeant. Le score global doit refléter la qualité du raisonnement.

        {format_instructions}
        """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        chain = prompt | self.llm | self.parser

        try:
            # Appel au LLM
            data = chain.invoke(context)

            # Création de l'objet en base de données
            report = FinalReport.objects.create(
                session=self.session,
                score_global=data.get('score_global', 0),
                diagnostic_found=data.get('diagnostic_found', False),
                feedback_strengths=data.get('strengths', []),
                feedback_improvements=data.get('improvements', []),
                detailed_analysis=data.get('detailed_analysis', "Pas d'analyse disponible."),
                key_questions_status=data.get('key_questions_checklist', {})
            )
            return report

        except Exception as e:
            print(f"Erreur Summarizer : {e}")
            raise e