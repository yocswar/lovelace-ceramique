<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\OrganisationModel;
use App\Models\UtilisateurModel;
use App\Services\UtilisateurValidator;
use App\Services\JwtAuth;
use PDO;
use Throwable;

// CRUD utilisateur — pour l'instant : créer (avec son organisation).
// À venir : lister, modifier, supprimer.
final class UtilisateurController
{
    public function creer(): void
    {
        header('Content-Type: application/json; charset=utf-8');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->repondreErreur(405, 'Méthode non autorisée');
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);

        if (!is_array($payload)) {
            $this->repondreErreur(400, 'Corps JSON invalide');
            return;
        }

        $organisationNom = trim((string) ($payload['organisation_nom'] ?? ''));
        $identifiant = trim((string) ($payload['identifiant'] ?? ''));
        $mdp = (string) ($payload['mdp'] ?? '');
        $email = trim((string) ($payload['email'] ?? ''));
        $nom = trim((string) ($payload['nom'] ?? ''));

        $validator = new UtilisateurValidator();
        $erreurs = $validator->valider($organisationNom, $identifiant, $mdp, $email, $nom);

        if ($erreurs !== []) {
            $this->repondreErreur(422, 'Données invalides', $erreurs);
            return;
        }

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $organisationModel = new OrganisationModel($pdo);
            $utilisateurModel = new UtilisateurModel($pdo);

            if ($utilisateurModel->identifiantExiste($identifiant)) {
                $this->repondreErreur(409, 'Cet identifiant est déjà utilisé');
                return;
            }

            if ($utilisateurModel->emailExiste($email)) {
                $this->repondreErreur(409, 'Cet email est déjà utilisé');
                return;
            }

            $pdo->beginTransaction();

            $organisationId = $organisationModel->creer($organisationNom);
            $utilisateurId = $utilisateurModel->creer(
                $identifiant,
                password_hash($mdp, PASSWORD_DEFAULT),
                $email,
                $nom,
                $organisationId,
                'Administrateur',
            );

            $pdo->commit();

            http_response_code(201);
            echo json_encode([
                'status' => 'ok',
                'organisation' => [
                    'id' => $organisationId,
                    'nom' => $organisationNom,
                ],
                'utilisateur' => [
                    'id' => $utilisateurId,
                    'identifiant' => $identifiant,
                    'email' => $email,
                    'nom' => $nom,
                    'organisation_id' => $organisationId,
                    'role' => 'Administrateur',
                ],
            ]);
        } catch (Throwable $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }

            error_log($e->getMessage());
            $this->repondreErreur(500, 'Impossible de créer l\'utilisateur');
        }
    }

    public function creerCollaborateur(): void
    {
        header('Content-Type: application/json; charset=utf-8');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Allow: POST');
            $this->repondreErreur(405, 'Méthode non autorisée');
            return;
        }

        // Vérifie le token de l'utilisateur connecté.
        $claims = JwtAuth::utilisateurConnecte();

        if ($claims === null) {
            $this->repondreErreur(401, 'Authentification requise');
            return;
        }

        $utilisateurId = $claims['sub'] ?? null;

        if (!is_int($utilisateurId) || $utilisateurId <= 0) {
            $this->repondreErreur(401, 'Jeton invalide');
            return;
        }

        try {
            $pdo = require __DIR__ . '/../config/db.php';
            $utilisateurModel = new UtilisateurModel($pdo);

            // Récupère le rôle et l'organisation actuels du compte.
            $utilisateur = $utilisateurModel->trouverParId($utilisateurId);

            if ($utilisateur === null) {
                $this->repondreErreur(401, 'Compte introuvable');
                return;
            }

            if ($utilisateur['role'] !== 'Administrateur') {
                $this->repondreErreur(403, 'Accès réservé aux administrateurs');
                return;
            }

            // Lit les données envoyées par le formulaire.
            $payload = json_decode(
                (string) file_get_contents('php://input'),
                true
            );

            if (!is_array($payload)) {
                $this->repondreErreur(400, 'Corps JSON invalide');
                return;
            }

            // Vérifie que chaque champ obligatoire contient du texte.
            foreach (['identifiant', 'mdp', 'email', 'nom'] as $champ) {
                if (!isset($payload[$champ]) || !is_string($payload[$champ])) {
                    $this->repondreErreur(
                        422,
                        'Les champs du compte doivent être des textes'
                    );
                    return;
                }
            }

            $identifiant = trim($payload['identifiant']);
            $mdp = $payload['mdp'];
            $email = trim($payload['email']);
            $nom = trim($payload['nom']);

            // Applique les règles communes aux comptes utilisateurs.
            $validator = new UtilisateurValidator();
            $erreurs = $validator->validerUtilisateur(
                $identifiant,
                $mdp,
                $email,
                $nom,
            );

            if ($erreurs !== []) {
                $this->repondreErreur(422, 'Données invalides', $erreurs);
                return;
            }

            // Vérifie la disponibilité de l'identifiant et de l'email.
            if ($utilisateurModel->identifiantExiste($identifiant)) {
                $this->repondreErreur(409, 'Cet identifiant est déjà utilisé');
                return;
            }

            if ($utilisateurModel->emailExiste($email)) {
                $this->repondreErreur(409, 'Cet email est déjà utilisé');
                return;
            }

            // Utilise l'organisation de l'administrateur et fixe le rôle.
            $organisationId = (int) $utilisateur['organisation_id'];

            $nouvelUtilisateurId = $utilisateurModel->creer(
                $identifiant,
                password_hash($mdp, PASSWORD_DEFAULT),
                $email,
                $nom,
                $organisationId,
                'Collaborateur',
            );

            // Confirme la création sans renvoyer le mot de passe.
            http_response_code(201);

            echo json_encode([
                'status' => 'ok',
                'message' => 'Le compte collaborateur a été créé',
                'utilisateur' => [
                    'id' => $nouvelUtilisateurId,
                    'identifiant' => $identifiant,
                    'email' => $email,
                    'nom' => $nom,
                    'organisation_id' => $organisationId,
                    'role' => 'Collaborateur',
                ],
            ]);
        } catch (\PDOException $e) {
            // Gère aussi un doublon créé par deux requêtes simultanées.
            if ($e->getCode() === '23505') {
                $this->repondreErreur(
                    409,
                    'Cet identifiant ou cet email est déjà utilisé'
                );
                return;
            }

            error_log($e->getMessage());
            $this->repondreErreur(500, 'Impossible de créer le collaborateur');
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->repondreErreur(500, 'Impossible de créer le collaborateur');
        }
    }

    // Renvoie les utilisateurs de l'organisation du compte connecté.
    public function lister(): void
    {
        header('Content-Type: application/json');

        $connecte = JwtAuth::utilisateurConnecte();

        if ($connecte === null) {
            http_response_code(401);
            echo json_encode(['message' => 'Non connecté']);
            return;
        }

        try {
            $pdo = require __DIR__ . '/../config/db.php';
            $model = new UtilisateurModel($pdo);

            $utilisateurs = $model->listerPourUtilisateur(
                (int) $connecte['sub']
            );

            echo json_encode(['utilisateurs' => $utilisateurs]);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Erreur serveur']);
        }
    }

    /** @param list<string>|null $erreurs */
    private function repondreErreur(int $code, string $message, ?array $erreurs = null): void
    {
        http_response_code($code);

        $corps = [
            'status' => 'error',
            'message' => $message,
        ];

        if ($erreurs !== null) {
            $corps['erreurs'] = $erreurs;
        }

        echo json_encode($corps);
    }
}
