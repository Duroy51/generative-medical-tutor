# backend/cases/services/case_importer.py

import json
from django.db import transaction
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from django.conf import settings

# Import des modèles mis à jour (Specialty remplace Category)
from cases.models import (
    Specialty, ClinicalCase, Symptom, MedicalHistory, CurrentTreatment,
    ComplementaryExam, PhysicalFinding, Diagnosis
)
from cases.schema.case_schemas import FullCaseStructure


@transaction.atomic
def save_structured_data_to_db(structured_data: dict, fultang_id: str):
    """
    Prend un dictionnaire de données structurées (validé par Pydantic),
    et sauvegarde toutes les informations dans la base de données Django.
    """
    pedagogical_data = structured_data.get('pedagogical_data', {})
    simulation_data = structured_data.get('simulation_data', {})
    clinical_data = structured_data.get('clinical_data', {})
    patient_info = clinical_data.get('patient_info', {})
    consultation_info = clinical_data.get('consultation_info', {})

    # --- 1. GESTION DES SPÉCIALITÉS (Ex-Catégories) ---
    # Le schéma Pydantic renvoie maintenant 'specialties'
    llm_specialties_names = pedagogical_data.get('specialties', [])
    final_specialties_to_assign = []
    created_specialties_names = []

    for spec_name in llm_specialties_names:
        clean_name = spec_name.strip()
        if not clean_name:
            continue

        # Utilisation du modèle Specialty
        spec_obj, created = Specialty.objects.get_or_create(
            name__iexact=clean_name,
            defaults={'name': clean_name}
        )
        if created:
            created_specialties_names.append(clean_name)

        final_specialties_to_assign.append(spec_obj)

    # --- 2. CRÉATION DU CAS CLINIQUE ---
    case_instance = ClinicalCase.objects.create(
        source_fultang_id=fultang_id,

        # Données Pédagogiques
        case_title=pedagogical_data.get('case_title', 'Titre manquant'),
        difficulty=pedagogical_data.get('difficulty', 'Moyen'),
        learning_objectives=pedagogical_data.get('learning_objectives', ''),
        key_questions=pedagogical_data.get('key_questions_to_ask', []),
        common_pitfalls=pedagogical_data.get('common_pitfalls', ''),

        # Données IA / Simulation
        patient_persona=simulation_data.get('patient_persona', ''),
        initial_statement=simulation_data.get('initial_statement', ''),
        # On peut laisser les prompts système vides, l'expert les remplira ou on utilisera les défauts
        system_prompt_patient=None,
        system_prompt_tutor=None,
        reasoning_graph=structured_data.get('reasoning_graph', {}),

        # Données Patient
        age=patient_info.get('age', 0),
        sexe=patient_info.get('sexe', 'Inconnu'),
        etat_civil=patient_info.get('etat_civil', ''),
        profession=patient_info.get('profession', ''),
        nombre_enfant=patient_info.get('nombre_enfant', 0),
        groupe_sanguin=patient_info.get('groupe_sanguin', ''),

        # Mode de vie (JSON)
        mode_de_vie=clinical_data.get('mode_de_vie', {}),

        # Données Consultation
        motif_consultation=consultation_info.get('motif_consultation', 'Non spécifié'),

        # Suggestions brutes (Notez le changement de clé)
        raw_llm_suggestions={'suggested_specialties': llm_specialties_names}
    )

    # Assignation ManyToMany des spécialités
    if final_specialties_to_assign:
        case_instance.specialties.set(final_specialties_to_assign)

    # --- 3. SAUVEGARDE DES DONNÉES LIÉES ---
    # L'utilisation de **kwargs permet de mapper automatiquement les champs détaillés
    # définis dans le schéma Pydantic vers les colonnes du modèle Django.

    for symptom_data in clinical_data.get('symptoms', []):
        Symptom.objects.create(case=case_instance, **symptom_data)

    for history_data in clinical_data.get('history_entries', []):
        MedicalHistory.objects.create(case=case_instance, **history_data)

    for treatment_data in clinical_data.get('current_treatments', []):
        CurrentTreatment.objects.create(case=case_instance, **treatment_data)

    for exam_data in clinical_data.get('exams', []):
        ComplementaryExam.objects.create(case=case_instance, **exam_data)

    for finding_data in clinical_data.get('physical_findings', []):
        PhysicalFinding.objects.create(case=case_instance, **finding_data)

    for diagnosis_data in clinical_data.get('diagnoses', []):
        Diagnosis.objects.create(case=case_instance, **diagnosis_data)

    return case_instance, created_specialties_names


def get_structured_data_from_llm(raw_data, existing_specialties_names):
    """
    Utilise LangChain pour transformer les données brutes en un JSON structuré et validé.
    Prend en compte les Spécialités.
    """
    specialties_list_str = ", ".join(existing_specialties_names)

    context_str = f"[{specialties_list_str}]" if existing_specialties_names else "(LISTE VIDE - CRÉEZ DES SPÉCIALITÉS PERTINENTES)"

    prompt_template = """
    Tâche : Analyser les données cliniques brutes suivantes et les transformer en un JSON riche et structuré pour une simulation pédagogique.

    Contexte Important (Liste des spécialités médicales officielles) : 
    {context_str}

    Instructions :
    1. Lis l'intégralité des données brutes.
    2. Remplis TOUS les champs du format JSON de sortie en te basant sur les données fournies.
    3. GESTION DES SPÉCIALITÉS (Champ "specialties") :
       - Attribue une ou plusieurs spécialités médicales (ex: Cardiologie, Pneumologie).
       - Choisis dans la liste fournie si possible, sinon crée-en une nouvelle pertinente.
       - Ne laisse JAMAIS le champ "specialties" vide.
    4. CRITIQUE : Le champ "case_title" est visible par l'étudiant AVANT la simulation. Il NE DOIT PAS révéler le diagnostic final.
    5. GRAPHE DE RAISONNEMENT (reasoning_graph) :
       - Construis un graphe logique qui explique la démarche médicale (liens entre symptômes et diagnostics).

    {format_instructions}

    Données brutes :
    {raw_data_str}

    JSON de sortie :
    """

    # Utilisation de Groq (Llama 3.3 70B)
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        api_key=settings.GROQ_API_KEY
    )

    # Le parser va lire FullCaseStructure (qui contient maintenant specialties et reasoning_graph)
    parser = JsonOutputParser(pydantic_object=FullCaseStructure)

    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    response_json = chain.invoke({
        "context_str": context_str,
        "raw_data_str": json.dumps(raw_data, ensure_ascii=False)
    })

    return response_json