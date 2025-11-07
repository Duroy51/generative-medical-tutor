import json
import os
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from cases.models import Category, ClinicalCase
from cases.services.case_importer import get_structured_data_from_llm, save_structured_data_to_db


class Command(BaseCommand):
    help = 'Importe de nouveaux cas cliniques, les structure via un LLM et les sauvegarde.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mock',
            action='store_true',
            help='Utilise le fichier de données mock au lieu de l\'API Fultang réelle.'
        )

    def handle(self, *args, **options):
        self.stdout.write("Début de l'importation des cas cliniques...")

        existing_categories_names = list(Category.objects.values_list('name', flat=True))
        self.stdout.write(f"{len(existing_categories_names)} catégories officielles chargées.")

        fultang_cases_raw = []
        if options['mock']:
            self.stdout.write(self.style.WARNING("Mode MOCK activé. Chargement des données locales."))
            try:
                fixture_path = os.path.join(settings.BASE_DIR, 'cases', 'fixtures', 'mock_fultang_api.json')
                with open(fixture_path, 'r', encoding='utf-8') as f:
                    fultang_cases_raw = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError) as e:
                self.stderr.write(self.style.ERROR(f"Erreur de chargement du fichier mock : {e}"))
                return
        else:
            self.stdout.write("Mode LIVE. Appel de l'API Fultang.")
            try:
                response = requests.get(f"{settings.FULTANG_API_URL}/new-cases")
                response.raise_for_status()
                fultang_cases_raw = response.json()
            except requests.RequestException as e:
                self.stderr.write(self.style.ERROR(f"Erreur de l'API Fultang : {e}"))
                return

        self.stdout.write(f"{len(fultang_cases_raw)} nouveaux cas trouvés à traiter.")

        successful_imports = 0
        failed_imports = 0
        for case_data_raw in fultang_cases_raw:
            fultang_id = case_data_raw.get('id')
            if not fultang_id:
                self.stderr.write(self.style.WARNING("Un cas sans ID a été trouvé. Ignoré."))
                failed_imports += 1
                continue

            if ClinicalCase.objects.filter(source_fultang_id=fultang_id).exists():
                self.stdout.write(f"Le cas {fultang_id} existe déjà. Ignoré.")
                continue

            self.stdout.write(f"Traitement du cas {fultang_id} avec le LLM...")

            try:
                structured_data = get_structured_data_from_llm(case_data_raw, existing_categories_names)
                if not structured_data:
                    self.stderr.write(
                        self.style.ERROR(f"Échec de la structuration des données pour le cas {fultang_id}."))
                    failed_imports += 1
                    continue

                case_instance, created_categories = save_structured_data_to_db(structured_data, fultang_id)

                success_message = f"Cas {fultang_id} importé (ID: {case_instance.id})."
                if created_categories:
                    success_message += f" Nouvelles catégories créées : {created_categories}"

                self.stdout.write(self.style.SUCCESS(success_message))
                successful_imports += 1

            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(f"Une erreur majeure est survenue lors du traitement du cas {fultang_id} : {e}"))
                failed_imports += 1

        self.stdout.write("-" * 30)
        self.stdout.write(self.style.SUCCESS(f"Importation terminée. {successful_imports} cas importés avec succès."))
        if failed_imports > 0:
            self.stdout.write(self.style.WARNING(f"{failed_imports} cas ont échoué."))