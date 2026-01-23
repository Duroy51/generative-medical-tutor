
<div align="center">
  <img src="./docs/images/logo.png" alt="MedTutor.AI Logo" width="120" />
  <h1>MedTutor.AI</h1>
  <p>
    <strong>Système de Tutorat Intelligent de 3ème génération pour la simulation du raisonnement clinique.</strong>
  </p>
  <p>
    Un environnement d'apprentissage immersif propulsé par l'IA Générative (Llama 3) pour former les futurs médecins.
  </p>
  
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Django](https://img.shields.io/badge/Backend-Django_REST-092E20?style=flat-square&logo=django)](https://www.djangoproject.com/)
  [![AI](https://img.shields.io/badge/AI-LangChain_%26_Groq-orange?style=flat-square)](https://groq.com/)
</div>

---

## 📋 Présentation

**MedTutor AI** est un Environnement Informatique pour l'Apprentissage Humain (EIAH) conçu pour combler le fossé entre la théorie médicale et la pratique clinique.

Contrairement aux simulateurs classiques basés sur des arbres de décision rigides, MedTutor AI utilise des **Grands Modèles de Langage (LLM)** pour générer des patients virtuels uniques, capables de dialoguer naturellement, d'exprimer des symptômes complexes et d'évoluer en fonction des actions de l'étudiant.

Le système intègre un **Tuteur Socratique** qui analyse le raisonnement de l'apprenant en temps réel et intervient uniquement lorsque c'est nécessaire, favorisant ainsi l'apprentissage par la découverte guidée (Scaffolding).

## ✨ Fonctionnalités Clés

### 🎓 Pour l'Apprenant
*   **Simulation Immersive "Split-Screen" :** Une interface séparant clairement le dialogue (Anamnèse) des gestes techniques (Examen Physique, Constantes).
*   **Moniteur Patient Temps Réel :** Les constantes vitales (TA, Pouls, SpO2) s'affichent dynamiquement sur un moniteur virtuel dès que l'étudiant effectue l'acte médical correspondant.
*   **Mentor Socratique (IA) :** Un assistant pédagogique analyse chaque question posée. Si l'étudiant s'égare, le mentor intervient via un "Sidecar" discret pour le remettre sur la voie sans donner la réponse.
*   **Suivi de Compétences (Skill Matrix) :** Un tableau de bord gamifié montrant la progression par spécialité (Cardiologie, Pneumologie, etc.) et par niveau (Novice -> Expert).
*   **Rapport de Fin de Session :** Une analyse détaillée comparant le diagnostic et le traitement de l'étudiant à la "Vérité Terrain" du cas, avec mise en évidence des questions clés oubliées.
*   **Onboarding Interactif :** Un tutoriel guidé (Driver.js) accompagne les premiers pas sur la plateforme.

### 🩺 Pour l'Expert Médical
*   **Pipeline d'Import Intelligent :** Importation automatique de cas bruts depuis l'hôpital (API Fultang) ou génération synthétique. L'IA structure les données, crée le graphe de raisonnement et catégorise le cas.
*   **Validation & Rejet Argumenté :** Workflow complet permettant d'approuver ou de rejeter des cas en spécifiant les incohérences (Symptômes, Logique, Âge) via un formulaire structuré.
*   **Filtres Avancés :** Moteur de recherche multicritères (Spécialité, Difficulté, Symptôme, Maladie) pour auditer la base de connaissances.
*   **"Boîte de Verre" :** Visualisation du graphe de raisonnement généré par l'IA et accès aux prompts système pour un contrôle total.

### 🛡️ Pour l'Administrateur
*   **Gestion des Rôles (RBAC) :** Création de comptes Experts, promotion/rétrogradation d'utilisateurs.
*   **Monitoring :** Vue d'ensemble de l'activité de la plateforme (KPIs).

## 📸 Aperçu des Interfaces

<table style="width:100%; border: none;">
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/login.jpeg" alt="Page de Connexion" width="400"/>
      <p><i>Page de Connexion & Inscription</i></p>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/simulation_interface.jpeg" alt="Dashboard Apprenant" width="400"/>
      <p><i>Dashboard Apprenant avec Progression</i></p>
    </td>
  </tr>
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/dialogue.jpeg" alt="Interface de Simulation" width="400"/>
      <p><i>Workspace de Simulation (Chat + Moniteur + Outils)</i></p>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/expert_dashboard.jpeg" alt="Dashboard Expert" width="400"/>
      <p><i>Dashboard Expert avec Filtres Avancés</i></p>
    </td>
  </tr>
    <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/super_admin.jpeg" alt="Dashboard Super Admin" width="400"/>
      <p><i>Dashboard Super Admin</i></p>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/rejet1.jpeg" alt="Modale de Rejet" width="400"/>
      <p><i>Workflow de Rejet Argumenté</i></p>
    </td>
  </tr>
</table>

## 🏗️ Architecture Technique

Le projet repose sur une architecture **Hybride** et **Modulaire**. Il combine la rigueur d'une base de données relationnelle (pour la vérité terrain et le suivi) avec la flexibilité d'un LLM (pour la sémantique et le dialogue).

### Diagramme de Contexte
Ce diagramme illustre les interactions entre l'Apprenant, l'Expert, et les systèmes externes (Fultang, Groq API).

![Diagramme de Contexte](./docs/images/contexte.png)

### Diagramme de Composants
Détail des modules internes : Orchestrateur Django, Agents IA (Simulateur, Évaluateur, Summarizer) et Interface Next.js.

![Diagramme de Composants](./docs/images/diagramme_composant.png)

---

## 🛠️ Stack Technologique

*   **Backend :** Python 3.10+, Django 5, Django REST Framework (DRF).
*   **Frontend :** Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Framer Motion.
*   **Intelligence Artificielle :**
    *   **Orchestration :** LangChain.
    *   **Modèle :** Llama 3 (via Groq API) pour une inférence ultra-rapide.
*   **Base de Données :** PostgreSQL (Relationnelle), MinIO (Stockage Objets/Datasets).
*   **Outils :** Git, Postman.

---

## 🚀 Guide d'Installation et de Lancement

Ce projet nécessite de lancer le Backend et le Frontend séparément.

### Prérequis Système
*   **Python 3.10** ou supérieur.
*   **Node.js 18** ou supérieur (et npm).
*   Une instance **PostgreSQL** active (ou SQLite pour un test rapide).
*   Une clé API **Groq** (Gratuite).

### 1. Installation du Backend (Django)

1.  Accédez au dossier backend :
    ```bash
    cd backend
    ```

2.  Créez et activez un environnement virtuel :
    ```bash
    python -m venv venv
    # Windows :
    venv\Scripts\activate
    # Mac/Linux :
    source venv/bin/activate
    ```

3.  Installez les dépendances :
    ```bash
    pip install -r requirements.txt
    ```

4.  Configurez les variables d'environnement :
    Créez un fichier `.env` dans le dossier `backend/` et ajoutez vos clés :
    ```ini
    SECRET_KEY=votre_cle_secrete_django
    DEBUG=True
    # Configuration IA
    GROQ_API_KEY=gsk_votre_cle_api_groq
    # Configuration Fultang (Optionnel pour test local)
    FULTANG_API_URL=http://fultang.ddns.net:8009/api/v1/medical/dataset/all/
    FULTANG_API_KEY=votre_token_fultang
    # Base de données (Si Postgres, sinon par défaut SQLite)
    # DATABASE_URL=postgres://user:password@localhost:5432/medtutor
    ```

5.  Appliquez les migrations et créez un administrateur :
    ```bash
    python manage.py migrate
    python manage.py createsuperuser
    ```

6.  (Optionnel) Chargez des données de démonstration :
    Cette commande simule une connexion à Fultang ou utilise des données locales si l'API est vide.
    ```bash
    python manage.py import_cases --mock
    ```

7.  Lancez le serveur :
    ```bash
    python manage.py runserver
    ```
    > Le backend est accessible sur : `http://127.0.0.1:8000`

### 2. Installation du Frontend (Next.js)

1.  Ouvrez un **nouveau terminal** et accédez au dossier frontend :
    ```bash
    cd frontend
    ```

2.  Installez les dépendances :
    ```bash
    npm install
    ```

3.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```
    > Le frontend est accessible sur : `http://localhost:3000`

---

## 📖 Guide d'Utilisation Rapide

1.  **Connexion :** Rendez-vous sur `http://localhost:3000`. Connectez-vous avec le compte `superuser` créé précédemment (Rôle Admin) ou créez un compte étudiant via "S'inscrire".
2.  **Dashboard Apprenant :**
    *   Cliquez sur une carte de cas pour voir les détails.
    *   Utilisez le bouton "Garde de Nuit" pour un cas aléatoire.
3.  **Simulation :**
    *   **Chat :** Posez des questions au patient.
    *   **Actes :** Utilisez la barre latérale pour prendre la tension ou ausculter. Observez le moniteur en haut se mettre à jour.
    *   **Diagnostic :** Cliquez sur le bouton flottant "Poser le Diagnostic" pour valider vos hypothèses.
4.  **Interface Expert :**
    *   Connectez-vous avec un compte ayant le rôle `EXPERT`.
    *   Accédez à `/expert` pour valider les nouveaux cas importés, modifier les prompts IA ou rejeter les cas incohérents.

## 📂 Structure des Dossiers

```
medtutor-ai/
├── backend/                # API Django REST
│   ├── cases/              # Gestion des Cas & Pipeline ETL
│   ├── simulation/         # Moteur de jeu & Chat
│   ├── evaluation/         # Agents Tuteur & Summarizer
│   ├── users/              # Auth & Profils
│   └── manage.py
│
├── frontend/               # Application Next.js
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   │   ├── (auth)/     # Login/Register
│   │   │   ├── (student)/  # Dashboard & Profil
│   │   │   ├── (expert)/   # Dashboard Expert
│   │   │   └── simulation/ # Interface de jeu
│   │   ├── components/     # Composants UI (Monitor, Workspace...)
│   │   ├── context/        # AuthContext
│   │   └── hooks/          # Logiciels des Tours (Driver.js)
│   └── public/
│
└── mock-fultang/           # Serveur de données de test (FastAPI)
```

---
### Liste des membres 
*   KOGHENE LADZOU ERIC (Chef)	
*   MOMBO-DINGBA  Emmanuel	
*   BIHAY Raphaël	
*   KOUDJOU TIEMIGNI VICRAND ARMEL	
*   DJONGO FOKOU ARIEL SHARON	
*   BADA RODOLPHE André	
*   MBIAMY NGAMENI Steven Loïc	


<div align="center">
  <p>Projet de STI - ENSPY 2025-2026</p>
</div>
