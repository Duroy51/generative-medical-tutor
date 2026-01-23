import csv
import json
import io
from datetime import datetime
from django.core.management.base import BaseCommand
from cases.models import ClinicalCase
from core.minio_client import upload_to_minio
from django.conf import settings


class Command(BaseCommand):
    help = "Exporte les cas cliniques de la base de données vers un fichier CSV ou JSON."

    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'json', 'jsonl'],
            default='jsonl',
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
        status = options['status']

        self.stdout.write(f"Début de l'exportation des cas '{status}' vers MinIO au format {file_format}...")

        # CORRECTION ICI : 'categories' -> 'specialties'
        cases_to_export = ClinicalCase.objects.filter(status=status).prefetch_related(
            'specialties', 'symptoms', 'history_entries', 'current_treatments',
            'exams', 'physical_findings', 'diagnoses'
        )

        if not cases_to_export.exists():
            self.stdout.write(self.style.WARNING(f"Aucun cas clinique avec le statut '{status}' n'a été trouvé."))
            return

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"dataset_{status}_{timestamp}.{file_format}"

        data_stream = None
        data_length = 0
        content_type = ''

        if file_format == 'csv':
            string_buffer = io.StringIO()
            self._export_to_csv(cases_to_export, string_buffer)

            csv_bytes = string_buffer.getvalue().encode('utf-8')
            data_stream = io.BytesIO(csv_bytes)
            data_length = len(csv_bytes)
            content_type = 'text/csv'
        else:  # json ou jsonl
            byte_buffer = io.BytesIO()
            self._export_to_json(cases_to_export, byte_buffer, pretty=(file_format == 'json'))

            data_stream = byte_buffer
            data_length = byte_buffer.getbuffer().nbytes
            content_type = 'application/json' if file_format == 'json' else 'application/x-jsonlines'

        data_stream.seek(0)

        try:
            upload_to_minio(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=file_name,
                data_stream=data_stream,
                length=data_length,
                content_type=content_type
            )
            self.stdout.write(self.style.SUCCESS(f"Exportation réussie ! Fichier '{file_name}' uploadé sur MinIO."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Erreur lors de l'upload sur MinIO : {e}"))

    def _export_to_csv(self, queryset, file_object):
        """Exporte un dataset complet et aplati au format CSV."""
        headers = [
            'case_id', 'case_title', 'status', 'age', 'sexe', 'motif_consultation',
            'specialties', 'symptoms_json', 'history_json', 'current_treatments_json',  # CORRECTION : Header renommé
            'exams_json', 'physical_findings_json', 'diagnoses_json'
        ]
        writer = csv.writer(file_object)
        writer.writerow(headers)

        for case in queryset:
            # CORRECTION ICI : case.categories -> case.specialties
            specialties_str = " | ".join([spec.name for spec in case.specialties.all()])

            symptoms_list = [{'nom': s.nom, 'localisation': s.localisation, 'degre': s.degre} for s in
                             case.symptoms.all()]
            history_list = [{'type': h.get_type_display(), 'description': h.description} for h in
                            case.history_entries.all()]
            treatments_list = [{'nom': t.nom, 'posologie': t.posologie} for t in case.current_treatments.all()]
            exams_list = [{'nom': e.nom, 'resultat': e.resultat} for e in case.exams.all()]
            findings_list = [{'nom_examen': p.nom_examen, 'resultat_observation': p.resultat_observation} for p in
                             case.physical_findings.all()]
            diagnoses_list = [{'description': d.description, 'is_final': d.is_final} for d in case.diagnoses.all()]

            row_data = [
                case.id,
                case.case_title,
                case.status,
                case.age,
                case.sexe,
                case.motif_consultation,
                specialties_str,  # Variable mise à jour
                json.dumps(symptoms_list, ensure_ascii=False),
                json.dumps(history_list, ensure_ascii=False),
                json.dumps(treatments_list, ensure_ascii=False),
                json.dumps(exams_list, ensure_ascii=False),
                json.dumps(findings_list, ensure_ascii=False),
                json.dumps(diagnoses_list, ensure_ascii=False)
            ]
            writer.writerow(row_data)

    def _export_to_json(self, queryset, file_object, pretty):
        """Exporte un dataset complet et hiérarchique en JSON ou JSONL."""
        all_cases_data = []
        for case in queryset:
            case_data = {
                'case_id': case.id,
                'case_title': case.case_title,
                'status': case.status,
                'age': case.age,
                'sexe': case.sexe,
                'motif_consultation': case.motif_consultation,
                # CORRECTION ICI : case.categories -> case.specialties
                'specialties': [spec.name for spec in case.specialties.all()],
                'symptoms': [
                    {'nom': s.nom, 'localisation': s.localisation, 'date_debut': s.date_debut, 'frequence': s.frequence,
                     'duree': s.duree, 'evolution': s.evolution, 'activite_declenchante': s.activite_declenchante,
                     'degre': s.degre}
                    for s in case.symptoms.all()
                ],
                'history_entries': [
                    {'type': h.get_type_display(), 'description': h.description}
                    for h in case.history_entries.all()
                ],
                'current_treatments': [
                    {'nom': t.nom, 'posologie': t.posologie, 'date_debut': t.date_debut, 'efficacite': t.efficacite}
                    for t in case.current_treatments.all()
                ],
                'exams': [
                    {'nom': e.nom, 'resultat': e.resultat}
                    for e in case.exams.all()
                ],
                'physical_findings': [
                    {'nom_examen': p.nom_examen, 'resultat_observation': p.resultat_observation}
                    for p in case.physical_findings.all()
                ],
                'diagnoses': [
                    {'description': d.description, 'is_final': d.is_final}
                    for d in case.diagnoses.all()
                ]
            }
            all_cases_data.append(case_data)

        if pretty:
            json_str = json.dumps(all_cases_data, ensure_ascii=False, indent=4)
            file_object.write(json_str.encode('utf-8'))
        else:
            for item in all_cases_data:
                json_line = json.dumps(item, ensure_ascii=False)
                file_object.write((json_line + '\n').encode('utf-8'))