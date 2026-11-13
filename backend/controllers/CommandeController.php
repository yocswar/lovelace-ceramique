<?php
// Contrôleur des commandes : reçoit la requête, vérifie le token et les données, demande au modèle, répond via la vue.
// GET  /api/pieces     → la liste des pièces pour le formulaire
// POST /api/commandes  → crée une commande et ses tickets
//
// Corps attendu du POST :
// { "nom_client": "Mme Martin", "pieces": [ { "piece_id": 3, "quantite": 2 }, ... ] }

declare(strict_types=1);

namespace App\Controllers;

use App\Models\CommandeModel;
use App\Views\CommandeView;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;
use Throwable;

final class CommandeController
{
    private const QUANTITE_MAX = 50; // garde-fou contre une faute de frappe (500 au lieu de 5)

    private CommandeView $view;

    public function __construct()
    {
        $this->view = new CommandeView();
    }

    // GET /api/pieces
    public function pieces(): void
    {
        if ($this->utilisateurConnecte() === null) {
            $this->view->error(401, 'Authentification requise');
            return;
        }

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $this->view->pieces((new CommandeModel($pdo))->toutesLesPieces());
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Impossible de charger les pièces');
        }
    }

    // POST /api/commandes
    public function creer(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->view->error(405, 'Méthode non autorisée');
            return;
        }

        $utilisateur = $this->utilisateurConnecte();
        if ($utilisateur === null) {
            $this->view->error(401, 'Authentification requise');
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($payload)) {
            $this->view->error(400, 'Corps JSON invalide');
            return;
        }

        // --- Validation des données ---
        $nomClient = trim((string) ($payload['nom_client'] ?? ''));
        if ($nomClient === '' || mb_strlen($nomClient) > 100) {
            $this->view->error(422, 'Le nom du client est obligatoire (100 caractères maximum)');
            return;
        }

        $lignes = [];
        foreach ((array) ($payload['pieces'] ?? []) as $ligne) {
            $pieceId = (int) ($ligne['piece_id'] ?? 0);
            $quantite = (int) ($ligne['quantite'] ?? 0);

            if ($pieceId <= 0 || $quantite < 1 || $quantite > self::QUANTITE_MAX) {
                $this->view->error(422, 'Chaque pièce doit avoir un identifiant valide et une quantité entre 1 et ' . self::QUANTITE_MAX);
                return;
            }
            $lignes[] = ['piece_id' => $pieceId, 'quantite' => $quantite];
        }

        if ($lignes === []) {
            $this->view->error(422, 'Une commande doit contenir au moins une pièce');
            return;
        }

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $model = new CommandeModel($pdo);

            if (!$model->piecesExistent(array_column($lignes, 'piece_id'))) {
                $this->view->error(422, 'Une des pièces demandées n\'existe pas');
                return;
            }

            $etapeId = $model->premiereEtapeId();
            if ($etapeId === null) {
                error_log('Création de commande impossible : la table etape est vide');
                $this->view->error(500, 'Configuration des étapes manquante');
                return;
            }

            $resultat = $model->creerAvecTickets($nomClient, (int) $utilisateur['sub'], $lignes, $etapeId);

            $this->view->creee($resultat['commande_id'], $resultat['nb_tickets']);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Impossible de créer la commande');
        }
    }

    // Lit le header « Authorization: Bearer <token> » et décode le JWT émis par AuthController.
    // Renvoie les claims (sub, identifiant, role…) ou null si le token est absent, invalide ou expiré.
    private function utilisateurConnecte(): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
            return null;
        }

        $secret = getenv('JWT_SECRET');
        if ($secret === false || $secret === '') {
            return null;
        }

        try {
            return (array) JWT::decode($m[1], new Key($secret, 'HS256'));
        } catch (Throwable $e) {
            return null;
        }
    }
}
