# Lovelace Céramique

## Contexte

Application web à destination des artisans potiers et céramistes — projet collectif Ada Tech School (CDA).

Notre application Saas (Software As A Service) permet de pouvoir suivre le processus de production d’un atelier céramique de petite taille. Le but est de pouvoir créer des workflows de production (Façonnage —> Séchage —> Engobage/Peinture —> Emaillage —> Cuisson —> Contrôle Qualité) et de pouvoir répondre aux commandes dans les temps.

Les artisans doivent pouvoir savoir à quel étape sont les objets, définir des échéances (temps de séchage : 24h) quand les objets sont prêts pour passer à l’étape suivante, suivre les pertes (casses, fissure,…) et sur quel tâche chaque artisan travaille.

Nous avons pour l'instant plusieurs propositions pour le nom de l'application qui n'est pas encore confirmé :

- PotterPilot
- ClayFlow
- PotterFlow
- PlanPot
- ZenPot

### Cible prioritaire

Les céramistes qui façonnent divers objets au quotidien et qui ont plusieurs processus de fabrications d'objets en même temps.

### Problème central

Chaque matin, Claire, céramiste et fondatrice d'un atelier de poterie, perd beaucoup de temps à se situer sur les différentes étapes des différents processus de création de poteries en cours. Cela peut entraîner des délais dans la fabrication, des retards dans les livraisons et une baisse de la satisfaction client.

### Contraintes non négociables

Les entreprises de céramiques sont généralement petites donc ils auront un budget restreint pour ce projet.
Il faut que l'usage de l'application au quotidien soit simple, pratique et rapide.

### Types profils

- Profil Admin : Peut créer des étapes, Faire passer des objets à une autre étape, supprimer des étapes, paramétrer une échéance, ajouter des membres, assigner des rôles en plus des droits Contributeur
- Profil Manager : Créer des commandes, les assigner à un utilisateur, validation des taches puis les déplacer dans chaque étapes de production jusqu’à ce que l’objet soit terminé
- Profil Contributeur : Créer des tâches, les assigner à un utilisateur, validation des taches puis les déplacer dans chaque étapes de production jusqu’à ce que l’objet soit terminé

### Périmêtre V1

- Système d’authentification organisation
  - Créer, modifier utilisateur (identifiants, mots de passe) (Must have)
  - Gérer les rôles, droits (Should have)
  - Page de connexion (Must have)
- Système d’authentification utilisateur (Should have)
- Création et gestion d’une étape de production (droits admin) (Must have)
- Réalisation d'une interface pour créer des tâches, les lister et les assigner à un artisan (droits basiques) (Must have)
- Délais de fabrication pièce unique ou volume(séchage, cuisson) (Must have)
- Suivi des pertes au cours de la production, à quel étape ? (casses, fissure, craquelage,…) (Must Have)

### Hors V1

- Notification qu'une cuisson est terminée (Wont Have)
- Interface qui stocke petit à petit les objets et qui notifie quand la cuisson peut être lancé (Wont Have)
- Gestion des stocks de matières premières (Wont have)
- Gestion commandes et livraisons ? (Won’t Have)
- Calendrier des commandes priorisation des commandes (Should Have)

## Environnement Technique

### Stack

Frontend : React 18
Backend : PHP 8.5
Base de données : PostgreSQL 16
Docker Compose

### Prérequis

- Docker Desktop (ou Docker Engine + Compose v2)
- Git
- Un compte GitHub avec accès au dépôt

```bash
docker info
```

### Installation

1. Cloner le dépôt

```bash
git clone https://github.com/yocswar/lovelace-ceramique.git lovelace-ceramique
cd lovelace-ceramique
```

2. Créer le fichier d’environnement

```bash
cp .env.example .env
```

3. Lancer la stack

```bash
docker compose up --build
```

4. Ouvrir http://localhost:8080

Tu dois voir la version PHP et « Connexion PostgreSQL OK ».

5. Ouvrir pgAdmin : http://localhost:5050

Identifiants pgAdmin (voir aussi `.env`) :

- Email : `ada@example.com`
- Mot de passe : `ada_dev`

Puis enregistrer le serveur PostgreSQL (Register → Server) :

| Champ                | Valeur         |
| -------------------- | -------------- |
| Name                 | Lovelace       |
| Host name/address    | `postgres`     |
| Port                 | `5432`         |
| Maintenance database | `lovelace`     |
| Username             | `lovelace`     |
| Password             | `lovelace_dev` |

Important : le host est `postgres` (nom du service Docker), pas `localhost`.

Arrêt : `docker compose down`

### Contribution et convention de travail

- Toujours partir de `main` à jour : `git switch main && git pull`
- Créer une branche : `git switch -c feature/ma-feature`
- Une branche = une feature ou un fix
- PR obligatoire avant merge sur `main` (1 approbation minimum)
- Convention de commits : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)

### Convention de nommage des branches

| Préfixe     | Usage                   | Exemple                         |
| ----------- | ----------------------- | ------------------------------- |
| `feature/`  | nouvelle fonctionnalité | `feature/catalogue-pieces`      |
| `fix/`      | correction de bug       | `fix/validation-email`          |
| `docs/`     | documentation           | `docs/readme-installation`      |
| `refactor/` | restructuration         | `refactor/separation-services`  |
| `chore/`    | config, deps, tooling   | `chore/mise-a-jour-dependances` |

Exemples :

1. Story « Afficher le catalogue des pièces » → `feature/catalogue-pieces`
2. Story « Corriger l’erreur de connexion API » → `fix/connexion-postgres`
3. Story « Documenter le choix PostgreSQL » → `docs/adr-choix-bdd`

### Outils

- Git
- Docker desktop
- Visual Studio Code
- IA (Chat Gpt, Claude, Github Copilot, Qwen)
- Excalidraw (Wireframe)
- Figma (Prototypage)

### Organisation du travail

- Sprint de 1-2 semaines
- Sprint planning - Jeudi 1 semaine sur 2 après la spé DevOps ( début 16h15-16h30)
- Daily 16h15 - 16h30 après les cours - idéalement tous les jours mais possibilité d'un jour sur 2
- Sprint review - Mercredi 1 semaine sur 2 après la spé DevOps ( début 16h15-16h30)
- Rétrospective - Mercredi 1 semaine sur 2 après la sprint review

### Équipe

- Goundoba D — …
- Esteban — …
- Maxence Fournier — …
- Victor — ...
- Emmanuel — ...
- Tom — ...
