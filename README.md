# Lovelace Céramique

Application web SaaS destinée aux artisans potiers et céramistes — projet collectif Ada Tech School (CDA).

**Nom de l'application :** PotterPilot. « Lovelace Céramique » désigne actuellement le projet.

## Sommaire

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Profils et droits envisagés](#2-profils-et-droits-envisagés)
3. [Fonctionnalités prévues pour la V1](#3-fonctionnalités-prévues-pour-la-v1)
4. [Environnement technique](#4-environnement-technique)
5. [Installation et démarrage](#5-installation-et-démarrage)
6. [API — Healthcheck](#6-api--healthcheck)
7. [Contribution et conventions Git](#7-contribution-et-conventions-git)
8. [Outils et organisation du travail](#8-outils-et-organisation-du-travail)
9. [ADR — Décisions d'architecture](#9-adr--décisions-darchitecture)

## 1. Contexte et objectifs

L'application vise à faciliter le suivi de la production dans les petits ateliers de céramique : **façonnage → séchage → engobage/peinture → émaillage → cuisson → contrôle qualité**. Elle doit aider les artisans à connaître l'étape de chaque objet, les échéances (par exemple, 24 h de séchage, 1 mois de fabrication), les tâches attribuées et les pertes (casse, fissure, craquelage), afin de respecter les délais.

### Cible prioritaire

Les céramistes qui fabriquent quotidiennement plusieurs objets et suivent plusieurs processus de production simultanément.

### Problème central

Chaque matin, Claire, céramiste et fondatrice d'un atelier, perd du temps à retrouver l'avancement des différentes pièces. Ce manque de visibilité peut provoquer des retards de fabrication et de livraison, et réduire la satisfaction des clients.

### Contraintes non négociables

- **Coût maîtrisé :** les petits ateliers disposent d'un budget limité.
- **Simplicité :** l'application doit être rapide et pratique à utiliser au quotidien.

## 2. Profils et droits envisagés

| Profil           | Responsabilités prévues                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrateur**   Créer, supprimer et configurer les étapes, définir les échéances, déplacer les objets entre étapes, ajouter des membres et attribuer des rôles ; dispose également des droits de contribution. |
| **Contributeur**       | Créer et attribuer des tâches, les valider et faire progresser les objets dans le workflow, selon les droits retenus.                                                                          |

> La répartition exacte des permissions devra être précisée avant l'implémentation de l'authentification et de l'autorisation.

## 3. Fonctionnalités prévues pour la V1

- Authentification au niveau de l'organisation : création et modification des utilisateurs et de leurs identifiants, gestion des mots de passe.
- Page de connexion.
- Création et gestion des étapes de production (droits Admin).
- Interface pour créer, lister et attribuer des tâches à un artisan.
- Suivi des délais de fabrication, de séchage et de cuisson, pour une pièce ou un volume.
- Suivi des pertes par étape (casse, fissure, craquelage, etc.).
- Gestion des rôles et des droits.
- Authentification individuelle des utilisateurs.

> La priorisation détaillée (analyse MoSCoW, fonctionnalités hors V1 ou à reconsidérer) est documentée dans [docs/MOSCOW.md](docs/MOSCOW.md).

## 4. Environnement technique

| Couche             | Technologies                                    |
| ------------------ | ----------------------------------------------- |
| Frontend           | React, Vite, JavaScript (JSX), CSS, ESLint      |
| Backend            | PHP 8.5, PHP-FPM, PDO PostgreSQL, API HTTP/JSON |
| Base de données    | PostgreSQL 17                                   |
| Administration BDD | pgAdmin 4                                       |
| Infrastructure     | Docker Compose, Nginx                           |
| Développement      | Git, GitHub, Visual Studio Code, Node.js, npm   |

### Architecture de développement

```text
Navigateur
   |
   v
React + Vite (localhost:5173)
   |
   | GET /api/healthcheck
   v
Proxy Vite (/api -> localhost:8080)
   |
   v
Nginx (localhost:8080)
   |
   v
PHP-FPM 8.5
   |
   | PDO / SQL
   v
PostgreSQL 17
```

Le frontend React fonctionne **hors Docker** pendant le développement. Docker exécute Nginx, PHP, PostgreSQL et pgAdmin. Le proxy de `frontend/vite.config.js` redirige les requêtes `/api` vers Nginx ; les composants peuvent donc appeler `fetch('/api/healthcheck')` sans URL absolue.

## 5. Installation et démarrage

### Prérequis

Avant de commencer, vérifier que les outils suivants sont installés :

- **Git**.
- **Docker** (Docker Desktop ou Docker Engine) **avec les plugins Docker Compose et Docker Buildx** : Compose pour lancer les services, Buildx pour pouvoir exécuter le build des images.
- **Node.js et npm**, dans une version compatible avec la version de Vite du projet.
- **OpenSSL** (pour générer le `JWT_SECRET`).
- Un éditeur de code, par exemple Visual Studio Code.

Vérification rapide :

```bash
git --version
docker --version
docker compose version
docker buildx version
node -v && npm -v
openssl version
```

> Même si Docker est déjà installé, `docker compose version` et `docker buildx version` doivent chacun renvoyer un numéro de version. Si l'une de ces commandes échoue, installer le plugin manquant (inclus dans Docker Desktop ; à installer séparément avec Docker Engine sous Linux) avant de passer à l'étape 3.

**Windows + WSL 2 :** démarrer Docker Desktop et activer l'intégration de la distribution dans **Settings → Resources → WSL Integration**. Exécuter les commandes depuis le même environnement de travail.

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/yocswar/lovelace-ceramique.git lovelace-ceramique
cd lovelace-ceramique
```

> Tant que la pull request d'architecture n'est pas fusionnée, les instructions React/PHP ci-dessous correspondent à la branche `chore/project-architecture`, et pas nécessairement à `main`.

### Étape 2 — Configurer l'environnement

```bash
cp .env.example .env
```

Adapter les valeurs si nécessaire. **Ne jamais commiter `.env`** : les identifiants fournis sont réservés au développement local.

#### Renseigner `JWT_SECRET`

Dans `.env`, remplacer la valeur `a-remplir` de `JWT_SECRET` par une valeur aléatoire **d'au moins 32 octets, soit 43 caractères minimum une fois encodée en base64**.

Générer la valeur avec :

```bash
openssl rand -base64 32
```

Cette commande produit une chaîne de 44 caractères (43 caractères + le `=` de fin). La copier telle quelle dans `.env` :

```dotenv
JWT_SECRET=<valeur-générée-par-la-commande>
```

> Chaque développeur génère **sa propre** valeur. Ne pas réutiliser une valeur d'exemple trouvée dans de la documentation et ne jamais partager ni commiter un secret réel.

### Étape 3 — Démarrer les services Docker

Vérifier que `docker compose` et `docker buildx` sont bien installés (voir [Prérequis](#prérequis)), puis, depuis la racine du dépôt :

```bash
docker compose up -d --build
docker compose ps
```

| Service         | Accès par défaut      | Remarque                                           |
| --------------- | --------------------- | -------------------------------------------------- |
| Nginx / API PHP | http://localhost:8080 | Port publié par Docker                             |
| PHP-FPM         | `php:9000`            | Réseau Docker interne, pas une page web            |
| PostgreSQL      | `postgres:5432`       | Nom d'hôte interne Docker ; port hôte configurable |
| pgAdmin         | http://localhost:5050 | Interface d'administration                         |

Les ports dépendent des variables du fichier `.env`. Vérifier que PostgreSQL est **healthy** dans `docker compose ps`.

### Étape 4 — Générer l'autoloader PHP et vérifier le backend

Composer est déjà disponible **dans le conteneur PHP** : il n'est pas nécessaire de l'installer sur sa machine.

**4.1 — Vérifier que Composer répond**

```bash
docker compose exec php composer --version
```

Un numéro de version doit s'afficher (par exemple `Composer version 2.x...`).

> Si la commande échoue, vérifier que les conteneurs tournent (`docker compose ps`).

**4.2 — Installer les dépendances (si ce n'est pas déjà fait)**

```bash
docker compose exec php composer install
```

**4.3 — Générer l'autoloader (obligatoire avant le healthcheck)**

```bash
docker compose exec php composer dump-autoload
```

À refaire à chaque ajout ou modification de classe dans les namespaces.

**4.4 — Vérifier le healthcheck**

Ouvrir http://localhost:8080/api/healthcheck ou lancer :

```bash
curl -i http://localhost:8080/api/healthcheck
```

Une réponse `HTTP 200 OK` avec `"status":"ok"` confirme que PHP a pu exécuter `SELECT 1` dans PostgreSQL. **La racine `http://localhost:8080/` n'est plus la page HTML de test initiale.**

### Étape 5 — Accéder à pgAdmin

Ouvrir http://localhost:5050.

**À la première ouverture, pgAdmin demande de définir un mot de passe maître (master password).** Choisir un mot de passe personnel : il protège les mots de passe enregistrés dans pgAdmin et doit être saisi avant de pouvoir connecter la base de données. Il n'est pas fourni par le projet.

Puis, dans **Register → Server**, renseigner :

| Champ                | Valeur de développement |
| -------------------- | ----------------------- |
| Name                 | Lovelace                |
| Host name/address    | `postgres`              |
| Port                 | `5432`                  |
| Maintenance database | `lovelace`              |
| Username             | `lovelace`              |
| Password             | `lovelace_dev`          |

**Important :** dans pgAdmin exécuté sous Docker, l'hôte est **`postgres`**, et non `localhost`. Les identifiants de PostgreSQL doivent correspondre aux valeurs effectives de `.env` et de la base initialisée.

### Étape 6 — Créer les tables et alimenter la base

Ces commandes se lancent **depuis le terminal**, à la racine du dépôt, avec les services Docker démarrés. L'étape 6.1 est **obligatoire** ; l'étape 6.2 (données de démonstration) est recommandée pour développer.

**6.1 — Créer les tables (`docs/MPD.sql`) — obligatoire**

```bash
docker compose cp docs/MPD.sql postgres:/tmp/lovelace-ceramique-MPD.sql
docker compose exec postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/lovelace-ceramique-MPD.sql'
```

**6.2 — Alimenter la base avec les données de test (`docs/seed.sql`)**

À lancer **après** la création des tables :

```bash
docker compose cp docs/seed.sql postgres:/tmp/lovelace-ceramique-seed.sql
docker compose exec postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/lovelace-ceramique-seed.sql'
```

> Le nom du fichier copié dans le conteneur doit être **identique** dans la commande `cp` et dans la commande `psql -f`. Avec `ON_ERROR_STOP=1`, le script s'arrête à la première erreur ; relancer un script déjà appliqué peut échouer (tables ou données déjà existantes).

Pour vérifier le résultat, ouvrir pgAdmin (étape 5) : les tables doivent apparaître dans **Databases → lovelace → Schemas → public → Tables**.

### Étape 7 — Tester l'inscription et la connexion

Pour valider que l'ensemble de la chaîne fonctionne (frontend, API, base de données), faire un test complet :

1. Démarrer le frontend :

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

2. Ouvrir http://localhost:5173.
3. **Créer un compte** utilisateur via la page d'inscription.
4. Se **déconnecter**, puis se **connecter** avec ce compte.
5. Vérifier dans pgAdmin que l'utilisateur apparaît bien dans la table correspondante.

Si l'inscription ou la connexion échoue, consulter le [dépannage](#dépannage-rapide).

### Arrêter et redémarrer

- **Services Docker :** depuis la racine du dépôt, `docker compose down`.
- **Redémarrage :** `docker compose up -d`, puis `npm run dev` depuis `frontend/`.

Ne pas utiliser `docker compose down -v` pour un arrêt normal : l'option `-v` supprime les volumes Docker et peut entraîner une perte de données PostgreSQL (il faudra alors rejouer l'étape 6).

### Dépannage rapide

| Problème                              | Vérification                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Docker introuvable dans WSL           | Docker Desktop démarré et intégration WSL activée                                             |
| `docker compose` ou `buildx` inconnu  | Installer le plugin manquant (voir [Prérequis](#prérequis))                                   |
| Frontend indisponible                 | `node -v`, `npm -v`, puis `npm ci` et `npm run dev` dans `frontend/`                          |
| Erreur de connexion dans React        | Tester successivement les deux URL de healthcheck ci-dessous                                  |
| PostgreSQL indisponible               | `docker compose ps` et `docker compose logs postgres`                                         |
| Erreur PHP / Nginx                    | `docker compose logs php` et `docker compose logs nginx`                                      |
| Classe PHP introuvable                | `docker compose exec php composer dump-autoload`                                              |
| Erreur d'authentification / JWT       | `JWT_SECRET` renseigné dans `.env` (43 caractères minimum), puis `docker compose up -d`       |
| Erreur `psql` : fichier introuvable   | Le nom du fichier est identique dans `docker compose cp` et dans `psql -f`                    |

```bash
curl -i http://localhost:8080/api/healthcheck
curl -i http://localhost:5173/api/healthcheck
```

Si la première URL fonctionne mais pas la seconde, vérifier le serveur Vite et son proxy.

## 6. API — Healthcheck

**Route :** `GET /api/healthcheck`

**Accès direct :** http://localhost:8080/api/healthcheck
**Accès via Vite :** http://localhost:5173/api/healthcheck

Cette route exécute `SELECT 1` via PDO pour vérifier la connexion à PostgreSQL.

**Réponse attendue — HTTP 200 :**

```json
{
  "status": "ok",
  "database": "connected",
  "result": 1,
  "message": "Connexion PostgreSQL OK"
}
```

En cas d'échec du service, l'API renvoie une erreur HTTP `503`. Une route inconnue renvoie `404`.

## 7. Contribution et conventions Git

- Partir d'un `main` à jour : `git switch main && git pull`.
- Créer une branche dédiée : `git switch -c feature/ma-feature`.
- Une branche par fonctionnalité ou correction.
- Ouvrir une **pull request** avant toute fusion vers `main` ; **au moins une approbation** est requise.
- Utiliser [Conventional Commits](https://www.conventionalcommits.org/) : `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

### Nommage des branches

| Préfixe     | Usage                              | Exemple                         |
| ----------- | ---------------------------------- | ------------------------------- |
| `feature/`  | Nouvelle fonctionnalité            | `feature/catalogue-pieces`      |
| `fix/`      | Correction de bug                  | `fix/validation-email`          |
| `docs/`     | Documentation                      | `docs/readme-installation`      |
| `refactor/` | Restructuration du code            | `refactor/separation-services`  |
| `chore/`    | Configuration, dépendances, outils | `chore/mise-a-jour-dependances` |

Exemples : « Afficher le catalogue des pièces » → `feature/catalogue-pieces` ; « Corriger la connexion API » → `fix/connexion-postgres` ; « Documenter le choix PostgreSQL » → `docs/adr-choix-bdd`.

## 8. Outils et organisation du travail

**Outils :** Git, Docker Desktop, Visual Studio Code, outils d'IA (ChatGPT, Claude, GitHub Copilot, Qwen), Excalidraw (wireframes), Figma (prototypage).

**Rythme envisagé :**

- Sprints de **1 à 2 semaines**.
- **Sprint planning :** jeudi, une semaine sur deux, après la spécialisation DevOps (vers 16 h 15–16 h 30).
- **Daily :** vers 16 h 15–16 h 30 après les cours, idéalement tous les jours ou un jour sur deux.
- **Sprint review :** mercredi, une semaine sur deux, après la spécialisation DevOps (vers 16 h 15–16 h 30).
- **Rétrospective :** mercredi après la sprint review.

### Équipe

- Goundoba D — Scrum master.
- Esteban — Reviewer.
- Maxence Fournier — Développeur.
- Victor — Développeur.
- Emmanuel — Développeur.
- Tom — Chef de projet.

## 9. ADR — Décisions d'architecture

Les décisions d'architecture du projet sont documentées dans le fichier [ADR.md](docs/ADR.md).
.