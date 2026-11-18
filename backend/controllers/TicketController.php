<?php
// Contrôleur des tickets : reçoit la requête, vérifie la méthode, demande aux modèles, répond via la vue.
// GET   /api/tickets                      → US.14 (voir les commandes à faire)
// PATCH /api/tickets/{id}/etape-suivante  → US.12 (passer la pièce à l'étape suivante)

declare(strict_types=1);

namespace App\Controllers;

use App\Models\EtapeModel;
use App\Models\TicketModel;
use App\Views\TicketView;
use PDO;
use Throwable;

final class TicketController
{
    private TicketView $view;

    public function __construct()
    {
        $this->view = new TicketView();
    }

    // US.14 : les étapes (colonnes) + les pièces des commandes actives (cartes)
    public function index(): void
    {
        $id = (int) ($_GET['id'] ?? 0);

        if ($id == 0) {
            $this->view->error(400, 'ID de commande nulle ou invalide');
            return;
        }

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';

            $etapes = (new EtapeModel($pdo))->findAll();
            $tickets = (new TicketModel($pdo))->findActifsFromCommand($id);

            $this->view->kanban($etapes, $tickets);
        } catch (Throwable $e) {
            error_log($e->getMessage()); // le détail va dans les logs Docker, jamais au navigateur
            $this->view->error(500, 'Impossible de charger les commandes');
        }
    }

        // US.12 : déplace le ticket vers l'étape choisie par glisser-déposer (en avant, en arrière ou en Perte)
    public function changerEtape(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($data['id'] ?? 0);
        $etapeId = (int) ($data['etape_id'] ?? 0);

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $ticketModel = new TicketModel($pdo);
            $etapeModel = new EtapeModel($pdo);

            if ($ticketModel->findById($id) === null) {
                $this->view->error(404, 'Ticket introuvable');
                return;
            }

            // On vérifie l'étape avant d'écrire : un id inventé donnerait sinon une erreur 500 de la base
            $etape = $etapeModel->findById($etapeId);
            if ($etape === null) {
                $this->view->error(404, 'Étape introuvable');
                return;
            }

            $ticketModel->updateEtape($id, $etapeId);
            $this->view->etapeChangee($id, $etape);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Impossible de changer l\'étape');
        }
    }
}
