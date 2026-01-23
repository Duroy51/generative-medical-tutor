<div align="center">
  <img src="./docs/images/logo.png" alt="MedTutor.AI Logo" width="120" />
  <h1>MedTutor.AI</h1>
  <p>
    <strong>Consolidation d'un système d'aide à la décision médicale et au raisonnement clinique basé sur les Systèmes Tutoriels Intelligents.</strong>
  </p>
  <p>
    Un simulateur médical de nouvelle génération utilisant l'IA Générative pour former les futurs médecins.
  </p>
</div>

---

**MedTutor AI** est un Environnement Informatique pour l'Apprentissage Humain (EIAH) qui permet aux étudiants en médecine de s'entraîner au raisonnement clinique. En interagissant avec des patients virtuels pilotés par des LLM, les apprenants développent leurs compétences en anamnèse, examen physique et diagnostic dans un environnement sécurisé, immersif et pédagogiquement riche.

## ✨ Fonctionnalités Clés

*   **🧠 Agents IA Autonomes :** Un système multi-agents (Patient, Tuteur, Expert) basé sur Llama 3 pour une simulation réaliste et un feedback pertinent.
*   **📚 Pipeline de Données Intelligent :** Connexion à l'API Fultang pour extraire des cas réels et les structurer automatiquement grâce à l'IA.
*   **🩺 Workspace Médical Complet :** Interface immersive séparant le dialogue (chat), l'examen physique (barre d'outils) et la prise de décision.
*   **👨‍🏫 Tutorat Socratique :** Un mentor IA intervient de manière non intrusive pour guider l'étudiant par la réflexion, sans jamais donner la réponse.
*   **📈 Suivi de Compétences :** Un dashboard personnalisé qui suit la progression de l'apprenant par spécialité grâce à une "Skill Matrix" dynamique.
*   **🛡️ Dashboards par Rôle :** Des interfaces dédiées et sécurisées pour l'Apprenant, l'Expert (validation) et l'Administrateur (gestion).

## Aperçu des Interfaces

<table style="width:100%; border: none;">
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/login.jpeg" alt="Page de Connexion" width="400"/>
      <p><i>Page de Connexion</i></p>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/simulation_interface.jpeg" alt="Dashboard Apprenant" width="400"/>
      <p><i>Dashboard Apprenant avec Skill Matrix</i></p>
    </td>
  </tr>
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/dialogue.jpeg" alt="Interface de Simulation" width="400"/>
      <p><i>Interface de Simulation (Chat + Outils)</i></p>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/expert_dashboard.jpeg" alt="Dashboard Expert" width="400"/>
      <p><i>Dashboard Expert pour la validation des cas</i></p>
    </td>
  </tr>
    <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/super_admin.jpeg" alt="Dashboard Super Admin" width="400"/>
      <p><i>Dashboard Super Admin pour la gestion des utilisateurs</i></p>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="./docs/images/rejet1.jpeg" alt="Modale de Rejet" width="400"/>
      <p><i>Modale de Rejet (Workflow Expert)</i></p>
    </td>
  </tr>
</table>


## 🏗️ Architecture Technique

Le projet est construit sur une architecture distribuée moderne, découplant le frontend, le backend et les services de données pour garantir la scalabilité et la maintenabilité.

### Diagramme de Contexte
Ce diagramme montre comment le système interagit avec ses utilisateurs et les services externes.

![Diagramme de Contexte](./docs/images/contexte.png)

### Diagramme de Composants
Ce diagramme détaille les différents services qui composent l'application.

![Diagramme de Composants](./docs/images/diagramme_composant.png)


## 🚀 Démarrage Rapide

Suivez ces instructions pour lancer l'environnement de développement complet sur votre machine.

### Prérequis

*   [Docker](https://www.docker.com/products/docker-desktop/) & Docker Compose
*   [Git](https://git-scm.com/)

### Installation et Lancement

1.  **Clonez le dépôt :**
    ```bash
    git clone https://votre-url-de-depot.git
    cd generative-medical-tutor
    ```

2.  **Configuration des variables d'environnement :**
    *   Créez un fichier `.env` dans le dossier `backend/`.
    *   Ajoutez vos clés d'API (Django `SECRET_KEY`, Groq `GROQ_API_KEY`, etc.) et la configuration de la base de données.

3.  **Lancez avec Docker Compose :**
    Cette commande unique va construire, lancer et connecter tous les services (Backend Django, Frontend Next.js, Base de données PostgreSQL, Stockage MinIO).
    ```bash
    docker-compose up --build
    ```
    Le premier démarrage peut prendre quelques minutes.

4.  **Accédez aux services :**
    *   **Frontend (Application) :** [http://localhost:3000](http://localhost:3000)
    *   **Backend (API Django) :** [http://localhost:8000/api/](http://localhost:8000/api/)
    *   **Admin Django :** [http://localhost:8000/admin/](http://localhost:8000/admin/)
    *   **Console MinIO :** [http://localhost:9001](http://localhost:9001)

## 🛠️ Stack Technologique

| Catégorie       | Technologies                                     |
| --------------- | ------------------------------------------------ |
| **Backend**     | Python, Django, Django REST Framework            |
| **Frontend**    | Next.js, TypeScript, React, Tailwind CSS         |
| **Base de Données** | PostgreSQL                                     |
| **IA & Orchestration** | LangChain, Groq API (Llama 3)                  |
| **Stockage Fichiers** | MinIO (S3 Compatible)                            |
| **Infrastructure** | Docker, Docker Compose                           |


## 📂 Structure du Projet

*   **`backend/`** : L'API Django. Contient la logique métier, les modèles de données et les agents IA.
    *   `cases/` : Gestion des cas cliniques et pipeline ETL.
    *   `simulation/` : Moteur de la simulation interactive.
    *   `evaluation/` : Agents Tuteur et analyse de performance.
    *   `users/` : Gestion des utilisateurs et de l'authentification.
*   **`frontend/`** : L'application Next.js. Contient les interfaces pour l'Apprenant, l'Expert et l'Admin.
    *   `src/app/(student)/` : Routes et layout de l'apprenant.
    *   `src/app/(expert)/` : Routes et layout de l'expert.
    *   `src/components/` : Composants UI réutilisables.
*   **`mock-fultang/`** : Serveur FastAPI simulant l'API de Fultang pour les tests.
*   **`docker-compose.yml`** : Fichier d'orchestration de tous les services.

---

<div align="center">
Projet de fin de cycle Pré-Ingénieur - ENSPY 2024-2025
</div>
