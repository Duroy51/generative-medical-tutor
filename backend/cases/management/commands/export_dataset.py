

import csv
import json
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from cases.models import ClinicalCase


class Command(BaseCommand):
    help = "Exporte les cas cliniques de la base de données vers un fichier CSV ou JSON."

    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'json', 'jsonl'],
            default='csv',
            help='Format du fichier de sortie (csv ou json). Par défaut : csv.'
        )
        parser.add_argument(
            '--output-path',
            type=str,
            default='./data_exports',
            help='Chemin du répertoire où sauvegarder le fichier.'
        )
        parser.add_argument(
            '--status',
            type=str,
            default='approuve',
            help='Statut des cas à exporter. Par défaut : "approuve".'
        )

    def handle(self, *args, **options):
        file_format = options['format']
        output_path = options['output_path']
        status = options['status']

        self.stdout.write(f"Début de l'exportation des cas '{status}' au format {file_format}...")


        cases_to_export = ClinicalCase.objects.filter(status=status).prefetch_related(
            'symptoms',
            'history_entries',
            'current_treatments',
            'exams',
            'physical_findings',
            'diagnoses'
        )

        if not cases_to_export.exists():
            self.stdout.write(self.style.WARNING("Aucun cas clinique avec le statut '{status}' n'a été trouvé."))
            return


        os.makedirs(output_path, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"dataset_{status}_{timestamp}.{file_format}"
        full_path = os.path.join(output_path, file_name)

        if file_format == 'csv':
            self._export_to_csv(cases_to_export, full_path)
        elif file_format == 'json':
            self._export_to_json(cases_to_export, full_path, pretty=True)
        elif file_format == 'jsonl':
            self._export_to_json(cases_to_export, full_path, pretty=False)

        self.stdout.write(self.style.SUCCESS(f"Exportation réussie ! Fichier sauvegardé dans : {full_path}"))



    def _export_to_csv(self, queryset, file_path):
        """Exporte les données dans un fichier CSV en aplatissant les relations."""
        print("--- EXECUTION DE LA VERSION CORRIGÉE DU CODE ---")
        headers = [
            'id', 'case_title', 'case_summary', 'age', 'sexe',
            'symptoms_list', 'medical_history_json', 'diagnoses_list'
        ]

        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)

            for case in queryset:

                symptoms_all = case.symptoms.all()
                symptoms_str = " | ".join([s.nom for s in symptoms_all]) if symptoms_all else ""

                diagnoses_all = case.diagnoses.all()
                diagnoses_str = " | ".join([d.description for d in diagnoses_all]) if diagnoses_all else ""

                history_list = [
                    {'type': h.get_type_display(), 'description': h.description}
                    for h in case.history_entries.all()
                ]

                history_json_str = json.dumps(history_list, ensure_ascii=False) if history_list else ""


                row_data = [
                    case.id,
                    case.case_title,
                    case.case_summary,
                    case.age,
                    case.sexe,
                    symptoms_str,
                    history_json_str,
                    diagnoses_str
                ]
                writer.writerow(row_data)

    def _export_to_json(self, queryset, file_path, pretty):
        """
        Exporte les données en JSON ou JSONL.
        - pretty=True (JSON) : Indenté, lisible pour les humains.
        - pretty=False (JSONL) : Un objet JSON compact par ligne, pour les machines.
        """
        dataset_list = []
        for case in queryset:
            case_data = {
                'id': case.id,
                'source_fultang_id': case.source_fultang_id,
                'case_title': case.case_title,
                'case_summary': case.case_summary,
                'learning_objectives': case.learning_objectives,
                'motif_consultation': case.motif_consultation,
                'age': case.age,
                'sexe': case.sexe,
                'mode_de_vie': case.mode_de_vie,
                'symptoms': [{'nom': s.nom, 'localisation': s.localisation, 'degre': s.degre} for s in
                             case.symptoms.all()],
                'history': [{'type': h.get_type_display(), 'description': h.description} for h in
                            case.history_entries.all()],
                'exams': [{'nom': e.nom, 'resultat': e.resultat} for e in case.exams.all()],
                'physical_findings': [{'nom_examen': p.nom_examen, 'resultat_observation': p.resultat_observation} for p
                                      in case.physical_findings.all()],
                'diagnoses': [{'description': d.description, 'is_final': d.is_final} for d in case.diagnoses.all()],
            }
            dataset_list.append(case_data)

        with open(file_path, 'w', encoding='utf-8') as f:
            if pretty:

                json.dump(dataset_list, f, ensure_ascii=False, indent=4)
            else:

                for item in dataset_list:
                    f.write(json.dumps(item, ensure_ascii=False) + '\n')