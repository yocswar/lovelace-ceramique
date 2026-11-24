<?php
// Contrôleur des tickets : reçoit la requête, vérifie la méthode, demande aux modèles, répond via la vue.
// GET   /api/tickets                      → US.14 (voir les commandes à faire)
// PATCH /api/tickets/{id}/etape-suivante  → US.12 (passer la pièce à l'étape suivante)
// DELETE /api/tickets                     → US.16 (supprimer un ticket)

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

    // US.13 : après une perte, l'artisan peut relancer la même pièce depuis le début
    public function recreer(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $ticketPerduId = (int) ($data['ticket_id'] ?? 0);

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $nouvelId = (new TicketModel($pdo))->recreer($ticketPerduId);

            if ($nouvelId === null) {
                $this->view->error(404, 'Ticket introuvable');
                return;
            }

            $this->view->ticketRecree($nouvelId);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Impossible de recréer la pièce');
        }
    }

    public function assignerUtilisateur(): void
    {
        // Vérifier que l'utilisateur est connecté
        $connecte = \App\Services\JwtAuth::utilisateurConnecte();

        if ($connecte === null) {
            $this->view->error(401, 'Non connecté');
            return;
        }

        // Récupérer les données envoyées par React
        $data = json_decode(file_get_contents('php://input'), true);

        $ticketId = (int) ($data['id'] ?? 0);
        $utilisateurId = isset($data['utilisateur_id'])
            ? (int) $data['utilisateur_id']
            : null;

        if ($ticketId <= 0 || ($utilisateurId !== null && $utilisateurId <= 0)) {
            $this->view->error(400, 'Identifiant invalide');
            return;
        }

        try {
            $pdo = require __DIR__ . '/../config/db.php';

            $ticketModel = new TicketModel($pdo);

            if ($ticketModel->findById($ticketId) === null) {
                $this->view->error(404, 'Ticket introuvable');
                return;
            }

            // Vérifier que l'assignation est autorisée
            if (!$ticketModel->verifierAssignation(
                $ticketId,
                $utilisateurId ?? (int) $connecte['sub'],
                (int) $connecte['sub']
            )) {
                $this->view->error(403, 'Assignation non autorisée');
                return;
            }

            // Enregistrer l'assignation
            $ticketModel->assignerUtilisateur($ticketId, $utilisateurId);


            header('Content-Type: application/json');
            echo json_encode(['message' => 'Assignation enregistrée']);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Erreur lors de l’assignation');
        }
    }
        // US.16 : supprime un ticket (suppression logique) après confirmation côté React
    public function supprimer(): void
    {
        $connecte = \App\Services\JwtAuth::utilisateurConnecte();

        if ($connecte === null) {
            $this->view->error(401, 'Non connecté');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($data['id'] ?? 0);

        if ($id <= 0) {
            $this->view->error(400, 'Identifiant invalide');
            return;
        }

        try {
            /** @var PDO $pdo */
            $pdo = require __DIR__ . '/../config/db.php';
            $ticketModel = new TicketModel($pdo);

            if ($ticketModel->findById($id) === null) {
                $this->view->error(404, 'Ticket introuvable');
                return;
            }

            // Le ticket doit appartenir à l'organisation de l'utilisateur connecté
            if (!$ticketModel->appartientALOrganisation($id, (int) $connecte['sub'])) {
                $this->view->error(403, 'Suppression non autorisée');
                return;
            }

            // Une commande doit garder au moins un ticket
            if ($ticketModel->compterActifsDeLaCommande($id) <= 1) {
                $this->view->error(409, 'Impossible de supprimer le dernier ticket de la commande');
                return;
            }

            $ticketModel->supprimer($id);
            $this->view->ticketSupprime($id);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->view->error(500, 'Impossible de supprimer le ticket');
        }
    }
}
