<?php
// Contrôleur des pièces : reçoit la requête, vérifie le token, demande au modèle, répond via la vue.
// GET /api/pieces → le catalogue de pièces (liste déroulante du formulaire de commande)

declare(strict_types=1);

namespace App\Controllers;

use App\Models\PieceModel;
use App\Services\JwtAuth;
use App\Views\PieceView;
use PDO;
use Throwable;

final class PieceController
{
    private PieceView $view;

    public function __construct()
    {
        $this->view = new PieceView();
    }

    public function index(): void
    {
        if (JwtAuth::utilisateurConnecte() === null) {
            $this->view->error(401, 'Authentification requise');
            return;
        }

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $this->view->liste((new PieceModel($pdo))->findAll());
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Impossible de charger les pièces');
        }
    }
}
