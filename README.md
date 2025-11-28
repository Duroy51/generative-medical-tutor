### Racine du Projet

*   **`backend/`** : Contient l'intégralité du projet Django. C'est le cœur de notre application.
*   **`frontend/`** : Contient l'intégralité du projet Next.js. Il sera développé par le pôle UX.
*   **`docker-compose.yml`** : Fichier d'orchestration Docker. C'est le "chef d'orchestre" qui lance et connecte tous les services (backend, frontend, base de données) d'un coup.
*   **`.gitignore`** : Spécifie les fichiers et dossiers que Git doit ignorer (ex: `venv/`, `__pycache__/`).

### `backend/` (Projet Django)

*   **`core/`** : Le "cœur" du projet Django. Il contient les fichiers de configuration globaux (`settings.py`), les routes URL principales (`urls.py`) et la configuration du serveur (`wsgi.py`, `asgi.py`).
*   **`manage.py`** : L'utilitaire en ligne de commande de Django, utilisé pour exécuter toutes les tâches de gestion (lancer le serveur, créer des migrations, etc.).
*   **`requirements.txt`** : La liste de toutes les dépendances Python du projet.
*   **`venv/`** : (Ignoré par Git) Le dossier de l'environnement virtuel Python, isolant les dépendances.

#### Applications Django

*   **`users/`** : Gère tout ce qui concerne les utilisateurs : modèles de profils (apprenant, expert), authentification, et permissions.
*   **`cases/`** : Au cœur de la mission de l'**Agent Ingénieur des Données**.
    *   **`models.py`** : Définit la structure des cas cliniques en base de données.
    *   **`logic/`** (à créer) : Contient la logique d'import depuis Fultang, d'anonymisation et de génération de fiches via le LLM.
    *   **`views.py`** : Gère les requêtes API pour la validation des cas par les experts.
*   **`simulation/`** : Gère la logique de l'**Agent Orchestrateur** et de l'**Agent Simulateur**.
    *   **`models.py`** : Définit les sessions de simulation, l'historique des conversations, etc.
    *   **`logic/`** (à créer) : Contient la logique de dialogue, la construction des prompts et l'implémentation de la RAG.
*   **`evaluation/`** : Gère la logique de l'**Agent Évaluateur-Tuteur**.
    *   **`logic/`** (à créer) : Contient les algorithmes de scoring, l'analyse de la performance et la génération des rapports de feedback.
*   **`api/`** : Une application dédiée à l'organisation de notre API REST. Elle centralise les routes de toutes les autres applications pour fournir un point d'entrée unique et propre (`/api/v1/...`).

## 🚀 Démarrage Rapide

Suivez ces instructions pour lancer le projet sur votre machine locale.

### Prérequis

*   [Git](https://git-scm.com/)
*   [Docker](https://www.docker.com/products/docker-desktop/)

### Installation et Lancement

1.  **Clonez le dépôt :**
    ```bash
    git clone [URL_DE_VOTRE_DEPOT_GITHUB]
    cd generative-medical-tutor
    ```

2.  **Lancez l'environnement avec Docker Compose :**
    Cette commande va construire les images Docker pour le backend et le frontend, et démarrer tous les conteneurs (y compris la base de données).
    ```bash
    docker-compose up --build
    ```
    La première exécution peut prendre plusieurs minutes.

3.  **Accédez aux services :**
    *   **Frontend (Application Apprenant/Expert) :** [http://localhost:3000](http://localhost:3000)
    *   **Backend (API Django) :** [http://localhost:8000](http://localhost:8000)
    *   **Documentation de l'API (Swagger) :** (à configurer)
    *   **Interface d'administration Django :** [http://localhost:8000/admin/](http://localhost:8000/admin/)

## 🛠️ Stack Technologique

*   **Backend :** Python, Django, Django REST Framework
*   **Frontend :** Next.js, TypeScript, React, Tailwind CSS
*   **Bases de Données :** PostgreSQL (relationnel), ChromaDB/Faiss (vectoriel)
*   **IA & Orchestration :** LangChain, Hugging Face Transformers
*   **Déploiement :** Docker

##  Contribution

Pour contribuer au projet, veuillez suivre ce workflow :

1.  Créez une nouvelle branche à partir de `main` : `git checkout -b feature/nom-de-la-feature`.
2.  Effectuez vos modifications et commitez votre travail.
3.  Poussez votre branche sur le dépôt distant : `git push origin feature/nom-de-la-feature`.
4.  Ouvrez une **Pull Request** sur GitHub pour revue.
5.  Une fois la revue approuvée, votre branche sera fusionnée dans `main`.

---