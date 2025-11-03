# backend/cases/management/commands/import_cases.py
import argparse

import requests
import json
import os
import google.generativeai as genai
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

from cases.models import ClinicalCase, Symptom, MedicalHistory, Category, CurrentTreatment, ComplementaryExam, \
    PhysicalFinding, Diagnosis


class Command(BaseCommand):
    help = 'Importe de nouveaux cas cliniques depuis Fultang, les structure via Gemini et les sauvegarde.'


    def add_arguments(self, parser):
        parser.add_argument(
            '--mock',
            action='store_true',
            help='Utilise le fichier de données mock au lieu de l\'API Fultang réelle.'
        )

    def handle(self, *args, **options):
        self.stdout.write("Début de l'importation des cas cliniques (Workflow Optimiste)...")


        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Clé d'API Google non configurée ou invalide: {e}"))
            return


        existing_categories_obj = Category.objects.all()
        existing_categories_names = [cat.name for cat in existing_categories_obj]
        self.stdout.write(f"{len(existing_categories_names)} catégories officielles chargées pour le contexte du LLM.")


        fultang_cases_raw = []
        if options['mock']:
            self.stdout.write(self.style.WARNING("Mode MOCK activé. Chargement des données depuis le fichier local."))
            try:
                fixture_path = os.path.join(settings.BASE_DIR, 'cases', 'fixtures', 'mock_fultang_api.json')
                with open(fixture_path, 'r', encoding='utf-8') as f:
                    fultang_cases_raw = json.load(f)
            except FileNotFoundError:
                self.stderr.write(self.style.ERROR(f"Fichier mock non trouvé à l'emplacement: {fixture_path}"))
                return
            except json.JSONDecodeError:
                self.stderr.write(self.style.ERROR("Le fichier mock contient du JSON invalide."))
                return
        else:
            self.stdout.write("Mode LIVE. Appel de l'API Fultang réelle.")
            try:
                headers = {'Authorization': f'Bearer {settings.FULTANG_API_KEY}'}
                response = requests.get(f"{settings.FULTANG_API_URL}/new-cases", headers=headers)
                response.raise_for_status()
                fultang_cases_raw = response.json()
            except requests.RequestException as e:
                self.stderr.write(self.style.ERROR(f"Erreur lors de la récupération des données de Fultang: {e}"))
                return

        self.stdout.write(f"{len(fultang_cases_raw)} nouveaux cas trouvés.")


        for case_data_raw in fultang_cases_raw:
            fultang_id = case_data_raw.get('id')
            if not fultang_id:
                self.stderr.write(self.style.WARNING("Un cas sans ID a été trouvé. Ignoré."))
                continue

            if ClinicalCase.objects.filter(source_fultang_id=fultang_id).exists():
                self.stdout.write(f"Le cas {fultang_id} existe déjà. Ignoré.")
                continue

            self.stdout.write(f"Traitement du cas {fultang_id} avec le LLM...")

            structured_data = self.get_structured_data_from_llm(case_data_raw, existing_categories_names)

            if not structured_data:
                self.stderr.write(self.style.ERROR(f"Échec de la structuration des données pour le cas {fultang_id}."))
                continue


            llm_categories_names = structured_data.get('categories', [])
            final_categories_to_assign = []

            for cat_name in llm_categories_names:
                clean_cat_name = cat_name.strip()
                if not clean_cat_name:
                    continue

                category_obj, created = Category.objects.get_or_create(
                    name__iexact=clean_cat_name,
                    defaults={'name': clean_cat_name}
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f"Nouvelle catégorie '{clean_cat_name}' créée à la volée."))

                final_categories_to_assign.append(category_obj)

            try:
                with transaction.atomic():

                    case_instance = ClinicalCase.objects.create(
                        source_fultang_id=fultang_id,
                        case_title=structured_data.get('case_title', 'Titre manquant'),
                        case_summary=structured_data.get('case_summary', ''),
                        learning_objectives=structured_data.get('learning_objectives', ''),
                        motif_consultation=structured_data.get('motif_consultation', ''),
                        age=structured_data.get('age'),
                        sexe=structured_data.get('sexe'),

                        #TODO Vérifier si il n'ya pas d'autres champs à ajouter

                        raw_llm_suggestions={'suggested_categories': llm_categories_names}
                    )


                    if final_categories_to_assign:
                        case_instance.categories.set(final_categories_to_assign)


                    for symptom_data in structured_data.get('symptoms', []):
                        Symptom.objects.create(case=case_instance, **symptom_data)


                    for history_data in structured_data.get('history_entries', []):
                        MedicalHistory.objects.create(case=case_instance, **history_data)


                    for treatment_data in structured_data.get('current_treatments', []):
                        CurrentTreatment.objects.create(case=case_instance, **treatment_data)


                    for exam_data in structured_data.get('exams', []):
                        ComplementaryExam.objects.create(case=case_instance, **exam_data)


                    for finding_data in structured_data.get('physical_findings', []):
                        PhysicalFinding.objects.create(case=case_instance, **finding_data)


                    for diagnosis_data in structured_data.get('diagnoses', []):
                        Diagnosis.objects.create(case=case_instance, **diagnosis_data)


                self.stdout.write(self.style.SUCCESS(
                    f"Cas {fultang_id} importé (ID: {case_instance.id}). "
                    f"Catégories assignées: {[c.name for c in final_categories_to_assign]}."
                ))

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Erreur lors de la sauvegarde du cas {fultang_id} en BDD: {e}"))

                self.stdout.write(self.style.SUCCESS(
                    f"Cas {fultang_id} importé (ID: {case_instance.id}). "
                    f"Catégories assignées: {[c.name for c in final_categories_to_assign]}."
                ))

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Erreur lors de la sauvegarde du cas {fultang_id} en BDD: {e}"))



    def get_structured_data_from_llm(self, raw_data, categories_list_str):
        """
        Envoie les données brutes à Gemini et attend un JSON structuré en retour.
        """

        prompt = f"""
            Tâche : Analyser les données cliniques brutes suivantes et les structurer au format JSON.

            Contexte Important : Voici la liste des catégories médicales officielles déjà existantes :
            [{categories_list_str}]

            Instructions :
            1. Lis attentivement les données cliniques brutes.
            2. Remplis tous les champs du JSON de sortie en te basant exclusivement sur les données fournies. Si une information n'est pas présente, laisse le champ comme une liste vide `[]` ou une chaîne vide `""`.
            3. Pour le champ "categories", attribue une ou plusieurs catégories PERTINENTES à ce cas en choisissant EXCLUSIVEMENT dans la liste fournie ci-dessus.
            4. EXCEPTION : Si, et seulement si, tu estimes avec une grande certitude que le cas appartient à une nouvelle catégorie médicale non présente dans la liste, tu peux l'ajouter dans le champ "categories".

            Format de sortie JSON attendu (uniquement le JSON) :
            {{
              "case_title": "string",
              "categories": ["string", "string"],
              "case_summary": "string",
              "learning_objectives": "string",
              "motif_consultation": "string",
              "age": integer,
              "sexe": "string (Homme/Femme)",
              "symptoms": [{{ "nom": "string", "localisation": "string", "date_debut": "string", "degre": integer }}],
              "history_entries": [{{ "type": "string (medical/chirurgical/familial/allergie)", "description": "string" }}],
              "current_treatments": [{{ "nom": "string", "posologie": "string" }}],
              "exams": [{{ "nom": "string", "resultat": "string" }}],
              "physical_findings": [{{ "nom_examen": "string", "resultat_observation": "string" }}],
              "diagnoses": [{{ "description": "string", "is_final": boolean }}]
            }}

            Données brutes :
            {raw_data}

            JSON de sortie :
            """

        try:

            model = genai.GenerativeModel(
                'gemini-flash-latest',
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(prompt)

            json_response_text = response.text

            return json.loads(json_response_text)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Erreur lors de l'appel à l'API Gemini: {e}"))
            if 'response' in locals():
                self.stderr.write(self.style.ERROR(f"Réponse brute de Gemini : {response.text}"))
            return None