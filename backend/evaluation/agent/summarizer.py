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

        # Utilisation de Llama 3 70B pour une analyse médicale fine
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            api_key=settings.GROQ_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=FinalReportStructure)

    def _get_context_data(self):
        """
        Prépare le contexte riche en incluant explicitement les décisions formelles.
        """

        # 1. Transcript du Chat (Pour l'anamnèse)
        messages = ChatMessage.objects.filter(session=self.session).order_by('timestamp')
        transcript = ""
        clinical_actions = []

        for msg in messages:
            if msg.sender == 'APPRENANT':
                # On capture les actions cliniques faites dans le chat
                if "[ACTION]" in msg.content:
                    action = msg.content.replace("[ACTION]", "").strip()
                    clinical_actions.append(action)
                    transcript += f"[ACTE TECHNIQUE] : {action}\n"
                else:
                    transcript += f"ÉTUDIANT: {msg.content}\n"
            elif msg.sender == 'PATIENT_IA':
                transcript += f"PATIENT: {msg.content}\n"

        actions_str = ", ".join(clinical_actions) if clinical_actions else "Aucun examen physique réalisé."

        # 2. Notes du Tuteur (Pour l'évaluation continue)
        eval_logs = EvaluationLog.objects.filter(message__session=self.session)
        eval_summary = ""
        for log in eval_logs:
            eval_summary += f"- Question: '{log.message.content}' -> Pertinence: {log.relevance_score}/10.\n"

        # 3. Vérité Terrain (Le Dossier Expert)
        c = self.case
        truth_context = f"""
        TITRE : {c.case_title}
        RÉSUMÉ : {c.case_summary}
        DIAGNOSTICS FINAUX (VRAIS) : {", ".join([d.description for d in c.diagnoses.all() if d.is_final])}
        DIAGNOSTICS DIFFÉRENTIELS : {", ".join([d.description for d in c.diagnoses.all() if not d.is_final])}
        TRAITEMENTS ATTENDUS : {", ".join([t.nom for t in c.current_treatments.all()])}
        QUESTIONS CLÉS : {c.key_questions}
        PIÈGES : {c.common_pitfalls}
        """

        # 4. Décisions de l'étudiant (Récupérées des champs dédiés)
        student_diag = self.session.student_diagnosis or "NON FORMULÉ"
        student_presc = self.session.student_prescription or "NON FORMULÉ"

        return {
            "transcript": transcript,
            "eval_notes": eval_summary,
            "truth": truth_context,
            "student_diagnosis": student_diag,
            "student_prescription": student_presc,
            "actions_list": actions_str
        }

    def generate_report(self) -> FinalReport:
        context = self._get_context_data()

        prompt_template = """
        Tu es un Professeur de Médecine Senior (Jury d'examen).
        Tu dois évaluer la performance clinique d'un étudiant.

        --- 1. LE CAS CLINIQUE (CORRIGÉ) ---
        {truth}

        --- 2. PERFORMANCE DE L'ÉTUDIANT ---
        > DIAGNOSTIC POSÉ PAR L'ÉTUDIANT : "{student_diagnosis}"
        > TRAITEMENT PROPOSÉ : "{student_prescription}"
        > EXAMENS PHYSIQUES RÉALISÉS : {actions_list}

        --- 3. DÉROULEMENT DE L'ANAMNÈSE (DIALOGUE) ---
        {transcript}

        --- GRILLE DE NOTATION STRICTE (Sur 100) ---

        1. **DIAGNOSTIC (40 points)** :
           - Compare le "DIAGNOSTIC POSÉ" avec les "DIAGNOSTICS FINAUX".
           - Si le sens médical est correct (même si les mots diffèrent légèrement) : 40/40.
           - Si c'est un diagnostic différentiel proche : 20/40.
           - Si c'est faux ou non formulé : 0/40. (diagnostic_found = false).

        2. **PRISE EN CHARGE & TRAITEMENT (30 points)** :
           - Le "TRAITEMENT PROPOSÉ" est-il cohérent avec la pathologie ?
           - A-t-il prescrit les bons médicaments ou la bonne orientation (ex: Urgences) ?

        3. **DÉMARCHE CLINIQUE (30 points)** :
           - A-t-il posé les questions clés (voir transcript) ?
           - A-t-il réalisé les examens physiques nécessaires (actions_list) ?

        --- SORTIE ATTENDUE ---
        Génère un rapport JSON.
        - `score_global` : La somme des points.
        - `diagnostic_found` : Booléen (Vrai seulement si le diagnostic principal est trouvé).
        - `detailed_analysis` : Explique pourquoi le diagnostic est bon/mauvais et commente la qualité de l'ordonnance.

        {format_instructions}
        """

        prompt = ChatPromptTemplate.from_template(
            template=prompt_template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        chain = prompt | self.llm | self.parser

        try:
            data = chain.invoke(context)

            report = FinalReport.objects.create(
                session=self.session,
                score_global=data.get('score_global', 0),
                diagnostic_found=data.get('diagnostic_found', False),
                feedback_strengths=data.get('strengths', []),
                feedback_improvements=data.get('improvements', []),
                detailed_analysis=data.get('detailed_analysis', "Pas d'analyse."),
                key_questions_status=data.get('key_questions_checklist', {})
            )
            return report

        except Exception as e:
            print(f"Erreur Summarizer : {e}")
            raise e