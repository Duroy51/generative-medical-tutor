# backend/cases/services/case_importer.py

import json
from django.db import transaction
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from cases.models import (
    Category, ClinicalCase, Symptom, MedicalHistory, CurrentTreatment,
    ComplementaryExam, PhysicalFinding, Diagnosis
)
from cases.schema.case_schemas import FullCaseStructure


@transaction.atomic
def save_structured_data_to_db(structured_data: dict, fultang_id: str):
    """
    Prend un dictionnaire de données structurées (validé par Pydantic),
    et sauvegarde toutes les informations dans la base de données Django
    en utilisant une transaction atomique.
    """
    pedagogical_data = structured_data.get('pedagogical_data', {})
    simulation_data = structured_data.get('simulation_data', {})
    clinical_data = structured_data.get('clinical_data', {})
    patient_info = clinical_data.get('patient_info', {})
    consultation_info = clinical_data.get('consultation_info', {})

    llm_categories_names = pedagogical_data.get('categories', [])
    final_categories_to_assign = []
    created_categories_names = []

    for cat_name in llm_categories_names:
        clean_cat_name = cat_name.strip()
        if not clean_cat_name:
            continue

        category_obj, created = Category.objects.get_or_create(
            name__iexact=clean_cat_name,
            defaults={'name': clean_cat_name}
        )
        if created:
            created_categories_names.append(clean_cat_name)

        final_categories_to_assign.append(category_obj)

    case_instance = ClinicalCase.objects.create(
        source_fultang_id=fultang_id,

        # Données Pédagogiques
        case_title=pedagogical_data.get('case_title', 'Titre manquant'),
        learning_objectives=pedagogical_data.get('learning_objectives', ''),

        # Données Patient
        age=patient_info.get('age', 0),  # 0 comme valeur par défaut pour un entier
        sexe=patient_info.get('sexe', 'Inconnu'),
        etat_civil=patient_info.get('etat_civil', ''),
        profession=patient_info.get('profession', ''),

        # J'ajoute les autres champs de votre modèle avec des valeurs par défaut
        nombre_enfant=patient_info.get('nombre_enfant', 0),
        groupe_sanguin=patient_info.get('groupe_sanguin', ''),
        mode_de_vie=clinical_data.get('mode_de_vie', {}),

        # Données Consultation
        motif_consultation=consultation_info.get('motif_consultation', 'Non spécifié'),

        # Données de Suggestion (toujours présentes)
        raw_llm_suggestions={'suggested_categories': llm_categories_names}
    )

    if final_categories_to_assign:
        case_instance.categories.set(final_categories_to_assign)

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

    return case_instance, created_categories_names


def get_structured_data_from_llm(raw_data: dict, existing_categories_names: list):
    """
    Utilise LangChain pour transformer les données brutes en un JSON structuré et validé,
    en se basant sur le schéma Pydantic FullCaseStructure.
    """
    categories_list_str = ", ".join(existing_categories_names)

    prompt_template = """
    Tâche : Analyser les données cliniques brutes suivantes et les transformer en un JSON riche et structuré pour une simulation pédagogique.

    Contexte Important : Voici la liste des catégories médicales officielles déjà existantes :
    [{categories_list_str}]

    Instructions :
    1. Lis l'intégralité des données brutes.
    2. Remplis TOUS les champs du format JSON de sortie en te basant sur les données fournies. Si une information est absente, tu dois l'estimer de manière plausible ou utiliser une valeur par défaut appropriée (chaîne vide `""`, liste vide `[]`, `null`).
    3. Pour "categories", choisis dans la liste fournie. Tu peux en suggérer une nouvelle si absolument nécessaire.
    4. Génère des données pédagogiques et de simulation pertinentes et utiles pour un étudiant en médecine.

    {format_instructions}

    Données brutes :
    {raw_data_str}

    JSON de sortie :
    """

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)

    parser = JsonOutputParser(pydantic_object=FullCaseStructure)

    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    response_json = chain.invoke({
        "categories_list_str": categories_list_str,
        "raw_data_str": json.dumps(raw_data, ensure_ascii=False)
    })

    return response_json