import json
import os
import requests
import time
from django.core.management.base import BaseCommand
from django.conf import settings
from cases.models import Specialty, ClinicalCase
from cases.services.case_importer import get_structured_data_from_llm, save_structured_data_to_db


class Command(BaseCommand):
    help = 'Importe de nouveaux cas cliniques (depuis Fultang ou via des données de démonstration) et les structure via IA.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mock',
            action='store_true',
            help='Force l\'utilisation du fichier de données mock (démonstration) sans tenter de connexion réseau.'
        )

    def handle(self, *args, **options):
        self.stdout.write("--- DÉMARRAGE DU SYSTÈME D'IMPORTATION ---")

        # 1. Chargement du contexte (SPÉCIALITÉS existantes)
        # On récupère la liste pour aider l'IA à catégoriser correctement
        existing_specialties_names = list(Specialty.objects.values_list('name', flat=True))
        self.stdout.write(f"Contexte : {len(existing_specialties_names)} spécialités existantes en base.")

        fultang_cases_raw = []
        use_fallback = False  # Indicateur pour savoir si on doit utiliser les données de démo

        # --- BRANCHE 1 : MODE MOCK FORCÉ ---
        if options['mock']:
            self.stdout.write(self.style.WARNING("🔶 Mode MOCK forcé par l'utilisateur."))
            use_fallback = True

        # --- BRANCHE 2 : MODE LIVE (TENTATIVE DE CONNEXION À FULTANG) ---
        else:
            self.stdout.write("\n1. TENTATIVE DE CONNEXION À FULTANG (LIVE)...")
            try:
                # Utilisation de l'URL et du Token définis dans .env
                url = settings.FULTANG_API_URL
                headers = {'Authorization': f'Token {settings.FULTANG_API_KEY}'}

                self.stdout.write(f"   Connexion à : {url} ...")
                response = requests.get(url, headers=headers, timeout=15)

                if response.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("   ✅ CONNEXION RÉUSSIE (HTTP 200)"))
                    api_data = response.json()

                    # Fultang renvoie généralement un objet avec une clé 'patients' ou une liste directe
                    # Adaptation selon la structure réelle de Fultang
                    if isinstance(api_data, dict):
                        real_patients = api_data.get('patients', [])
                    elif isinstance(api_data, list):
                        real_patients = api_data
                    else:
                        real_patients = []

                    count = len(real_patients)

                    if count == 0:
                        # --- SCÉNARIO : BASE FULTANG VIDE ---
                        self.stdout.write(self.style.WARNING(
                            f"   ⚠️  AVERTISSEMENT : La base de données Fultang est accessible mais VIDE (0 patients trouvés)."))
                        self.stdout.write(
                            "   -> Bascule automatique vers le mode DÉMONSTRATION pour présenter le fonctionnement.")
                        use_fallback = True
                    else:
                        self.stdout.write(self.style.SUCCESS(f"   🚀 {count} patients récupérés depuis Fultang."))
                        fultang_cases_raw = real_patients
                else:
                    self.stdout.write(self.style.ERROR(f"   ❌ Erreur API Fultang : Code {response.status_code}"))
                    self.stdout.write("   -> Bascule vers le mode DÉMONSTRATION par sécurité.")
                    use_fallback = True

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   ❌ Échec de la connexion réseau : {e}"))
                self.stdout.write("   -> Bascule vers le mode DÉMONSTRATION.")
                use_fallback = True

        # --- CHARGEMENT DES DONNÉES DE DÉMO (SI NÉCESSAIRE) ---
        if use_fallback:
            self.stdout.write("\n2. CHARGEMENT DES DONNÉES DE DÉMONSTRATION (Mock)...")
            try:
                fixture_path = os.path.join(settings.BASE_DIR, 'cases', 'fixtures', 'mock_fultang_api.json')
                with open(fixture_path, 'r', encoding='utf-8') as f:
                    fultang_cases_raw = json.load(f)
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ {len(fultang_cases_raw)} cas de démonstration chargés avec succès."))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"   ❌ Erreur critique chargement démo : {e}"))
                return

        # --- TRAITEMENT INTELLIGENT (BOUCLE COMMUNE) ---
        if not fultang_cases_raw:
            self.stdout.write(self.style.WARNING("Aucune donnée à traiter."))
            return

        self.stdout.write(f"\n3. TRAITEMENT INTELLIGENT VIA GEN-AI ({len(fultang_cases_raw)} cas)...")

        successful_imports = 0
        failed_imports = 0

        for case_data_raw in fultang_cases_raw:
            fultang_id = case_data_raw.get('id')
            if not fultang_id:
                continue

            # Vérification de doublon
            if ClinicalCase.objects.filter(source_fultang_id=fultang_id).exists():
                self.stdout.write(f"   - Le cas {fultang_id} existe déjà. Ignoré.")
                continue

            self.stdout.write(f"   - Structuration du cas {fultang_id}...")

            # Petite pause pour respecter les quotas API de Groq (2s est suffisant)
            time.sleep(2)

            try:
                # 1. Appel à l'IA pour structurer les données brutes
                # On passe la liste des spécialités existantes pour le contexte
                structured_data = get_structured_data_from_llm(case_data_raw, existing_specialties_names)

                if not structured_data:
                    self.stderr.write(self.style.ERROR(f"     [ÉCHEC] Structuration échouée pour {fultang_id}."))
                    failed_imports += 1
                    continue

                # 2. Sauvegarde en base de données via le service
                case_instance, created_specialties = save_structured_data_to_db(structured_data, fultang_id)

                msg = f"     [SUCCÈS] Cas importé (ID: {case_instance.id})."
                if created_specialties:
                    msg += f" Spécialités créées: {created_specialties}"
                self.stdout.write(self.style.SUCCESS(msg))
                successful_imports += 1

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"     [ERREUR] {e}"))
                failed_imports += 1

        self.stdout.write("\n" + "=" * 40)
        self.stdout.write(
            self.style.SUCCESS(f"IMPORTATION TERMINÉE. Succès: {successful_imports} | Échecs: {failed_imports}"))