<?php
// Modèle des tickets (table commande_ticket) : un ticket = une pièce à fabriquer dans une commande.
// Toutes les requêtes SQL sur les tickets sont ici, jamais dans le contrôleur.

declare(strict_types=1);

namespace App\Models;

use PDO;

final class TicketModel
{
    public function __construct(private PDO $pdo) {}

    // Les pièces des commandes encore actives (à faire ou en cours) : les cartes du Kanban (US.14).
    // LEFT JOIN sur utilisateur : une pièce peut ne pas encore être assignée (utilisateur_id NULL),
    // avec un JOIN simple elle disparaîtrait du tableau.
    public function findActifsFromCommand(int $commandeId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT ct.id, ct.commande_id, c.nom_client, c.statut,
                    p.nom AS piece, ct.etape_id, u.nom AS artisan
             FROM commande_ticket ct
             JOIN commande c ON c.id = ct.commande_id
             JOIN piece p ON p.id = ct.piece_id
             JOIN etape e ON e.id = ct.etape_id
             LEFT JOIN utilisateur u ON u.id = ct.utilisateur_id
             WHERE c.statut IN ('a_faire', 'en_cours') AND c.id = :commande_id
             ORDER BY e.ordre, c.id, ct.id"
        );
        $stmt->execute(['commande_id' => $commandeId]);
        return $stmt->fetchAll();
    }

    // Un ticket avec l'ordre de son étape actuelle (sert à trouver l'étape suivante).
    // Renvoie null si le ticket n'existe pas.
    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ct.id, ct.etape_id, e.ordre
             FROM commande_ticket ct
             JOIN etape e ON e.id = ct.etape_id
             WHERE ct.id = :id'
        );
        $stmt->execute(['id' => $id]);
        $ticket = $stmt->fetch();

        return $ticket === false ? null : $ticket;
    }

    // Passe le ticket à une autre étape (US.12)
    public function updateEtape(int $ticketId, int $etapeId): void
    {
        $stmt = $this->pdo->prepare('UPDATE commande_ticket SET etape_id = :etape_id WHERE id = :id');
        $stmt->execute(['etape_id' => $etapeId, 'id' => $ticketId]);
    }

        // US.13 : recrée la pièce perdue (même pièce, même commande) dans la première étape.
    // L'artisan n'est pas copié : la nouvelle pièce repart sans personne assignée.
    public function recreer(int $ticketPerduId): ?int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO commande_ticket (piece_id, commande_id, etape_id)
             SELECT piece_id, commande_id,
                    (SELECT id FROM etape ORDER BY ordre LIMIT 1)
             FROM commande_ticket
             WHERE id = :id
             RETURNING id'
        );
        $stmt->execute(['id' => $ticketPerduId]);
        $nouvelId = $stmt->fetchColumn();

        return $nouvelId === false ? null : (int) $nouvelId;
    }
}
