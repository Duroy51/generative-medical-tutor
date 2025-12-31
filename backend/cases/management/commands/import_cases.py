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
        self.stdout.write("--- DÉMARRAGE DU SYSTÈME D'IMPORTATION ---")

        # 1. Chargement du contexte (Catégories)
        existing_categories_names = list(Category.objects.values_list('name', flat=True))
        self.stdout.write(f"Contexte : {len(existing_categories_names)} catégories existantes en base.")

        fultang_cases_raw = []
        use_fallback = False  # Indicateur pour savoir si on doit utiliser les données de démo

        # --- BRANCHE 1 : MODE MOCK FORCÉ ---
        if options['mock']:
            self.stdout.write(self.style.WARNING("🔶 Mode MOCK forcé par l'utilisateur."))
            use_fallback = True

        # --- BRANCHE 2 : MODE LIVE (TENTATIVE DE CONNEXION) ---
        else:
            self.stdout.write("\n1. TENTATIVE DE CONNEXION À FULTANG (LIVE)...")
            try:
                url = settings.FULTANG_API_URL
                headers = {'Authorization': f'Token {settings.FULTANG_API_KEY}'}

                self.stdout.write(f"   Connexion à : {url} ...")
                response = requests.get(url, headers=headers, timeout=15)

                if response.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("   ✅ CONNEXION RÉUSSIE (HTTP 200)"))
                    api_data = response.json()

                    # Fultang renvoie un objet avec une clé 'patients'
                    real_patients = api_data.get('patients', [])

                    count = len(real_patients)
                    if count == 0:
                        # --- LE MESSAGE EXPLICITE QUE TU VEUX ---
                        self.stdout.write(self.style.WARNING(
                            f"   ⚠️  AVERTISSEMENT : La base de données Fultang est accessible mais VIDE (0 patients trouvés)."))
                        self.stdout.write("   -> Bascule automatique vers le mode DÉMONSTRATION pour la présentation.")
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

            if ClinicalCase.objects.filter(source_fultang_id=fultang_id).exists():
                self.stdout.write(f"   - Le cas {fultang_id} existe déjà. Ignoré.")
                continue

            self.stdout.write(f"   - Traitement et structuration du cas {fultang_id}...")

            # Petite pause pour respecter les quotas API (Groq est rapide, 2s suffit)
            import time
            time.sleep(2)

            try:
                structured_data = get_structured_data_from_llm(case_data_raw, existing_categories_names)
                if not structured_data:
                    self.stderr.write(self.style.ERROR(f"     [ÉCHEC] Structuration échouée pour {fultang_id}."))
                    failed_imports += 1
                    continue

                case_instance, created_categories = save_structured_data_to_db(structured_data, fultang_id)

                msg = f"     [SUCCÈS] Cas importé (ID: {case_instance.id})."
                if created_categories:
                    msg += f" Catégories créées: {created_categories}"
                self.stdout.write(self.style.SUCCESS(msg))
                successful_imports += 1

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"     [ERREUR] {e}"))
                failed_imports += 1

        self.stdout.write("\n" + "=" * 40)
        self.stdout.write(
            self.style.SUCCESS(f"IMPORTATION TERMINÉE. Succès: {successful_imports} | Échecs: {failed_imports}"))