# backend/cases/management/commands/import_cases.py
import argparse

import requests
import json
import os
import google.generativeai as genai
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

from cases.models import ClinicalCase, Symptom, MedicalHistory


class Command(BaseCommand):
    help = 'Importe de nouveaux cas cliniques depuis Fultang, les structure via Gemini et les sauvegarde.'


    def add_arguments(self, parser):
        parser.add_argument(
            '--mock',
            action='store_true',
            help='Utilise le fichier de données mock au lieu de l\'API Fultang réelle.'
        )


    def handle(self, *args, **options):
        self.stdout.write("Début de l'importation des cas cliniques via Gemini...")


        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Clé d'API Google non configurée ou invalide: {e}"))
            return

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

        self.stdout.write(f"{len(fultang_cases_raw)} nouveaux cas trouvés dans Fultang.")

        for case_data_raw in fultang_cases_raw:
            fultang_id = case_data_raw.get('id')
            if not fultang_id or ClinicalCase.objects.filter(source_fultang_id=fultang_id).exists():
                self.stdout.write(f"Le cas {fultang_id} existe déjà. Ignoré.")
                continue

            self.stdout.write(f"Traitement du cas {fultang_id} avec le LLM...")
            structured_data = self.get_structured_data_from_llm(case_data_raw)
            if not structured_data:
                self.stderr.write(self.style.ERROR(f"Échec de la structuration des données pour le cas {fultang_id}."))
                continue

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
                    )

                    for symptom_data in structured_data.get('symptoms', []):
                        Symptom.objects.create(case=case_instance, **symptom_data)

                    for history_data in structured_data.get('history_entries', []):
                        MedicalHistory.objects.create(case=case_instance, **history_data)

                self.stdout.write(
                    self.style.SUCCESS(f"Cas {fultang_id} importé avec succès avec l'ID BDD: {case_instance.id}"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Erreur lors de la sauvegarde du cas {fultang_id}: {e}"))



    def get_structured_data_from_llm(self, raw_data):
        """
        Envoie les données brutes à Gemini et attend un JSON structuré en retour.
        """

        prompt = f"""
        Tâche : Extraire, structurer et synthétiser les données cliniques brutes suivantes en un JSON propre et concis pour une utilisation pédagogique.
        Le JSON de sortie doit IMPÉRATIVEMENT suivre cette structure et ne contenir que du JSON valide, sans texte avant ou après :
        {{
          "case_title": "string",
          "case_summary": "string",
          "learning_objectives": "string",
          "motif_consultation": "string",
          "age": integer,
          "sexe": "string (Homme/Femme)",
          "symptoms": [{{ "nom": "string", "localisation": "string", "date_debut": "string", "degre": integer }}],
          "history_entries": [{{ "type": "string (medical/chirurgical/familial/allergie)", "description": "string" }}]
        }}
        Ne pas inclure d'informations personnelles identifiables (noms, adresses, dates exactes).

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