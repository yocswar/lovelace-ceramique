<?php
// Modèle des commandes (tables commande + commande_ticket, et lecture de etape).
// Toutes les requêtes SQL de la création de commande sont ici, jamais dans le contrôleur.

declare(strict_types=1);

namespace App\Models;

use PDO;
use Throwable;

final class CommandeModel
{
    public function __construct(private PDO $pdo) {}

    // Récupération des commandes avec le statut "a_faire" ou "en_cours" de la plus ancienne à la plus récente
    public function recupererCommandesEnCours(int $id): array
    {
        try {
            // date_creation et statut ('a_faire') sont remplis par les DEFAULT de la table
            $stmt = $this->pdo->prepare(
                "SELECT c.id,c.nom_client, c.statut
                FROM commande c
                JOIN utilisateur u on u.id = c.utilisateur_id
                WHERE c.statut IN ('a_faire', 'en_cours', 'a_finaliser')
                AND u.organisation_id = :orga_id
                ORDER BY c.date_creation"
            );

            $stmt->execute(['orga_id' => $id]);

            return $stmt->fetchAll();
        } catch (Throwable $e) {
            throw $e; // le contrôleur loggue et répond 500
        }
    }

    public function updateStatut(int $commandeId, string $statut): void
    {
        $stmt = $this->pdo->prepare(
            "UPDATE commande
            SET statut = :statut
            WHERE id = :id
            AND statut IN ('a_faire', 'en_cours', 'a_finaliser')"
        );

        $stmt->execute([
            'statut' => $statut,
            'id' => $commandeId
        ]);
    }

    public function finaliserCommande(int $commandeId, int $utilisateurId): bool
    {
        $stmt = $this->pdo->prepare(
            "UPDATE commande c
            SET statut = 'terminee'
            WHERE c.id = :commande_id
            AND c.statut = 'a_finaliser'
            AND c.utilisateur_id IN (
                SELECT id FROM utilisateur
                WHERE organisation_id = (
                    SELECT organisation_id FROM utilisateur
                    WHERE id = :utilisateur_id
                )
            )
            AND EXISTS (
                SELECT 1 FROM commande_ticket ct
                WHERE ct.commande_id = c.id
                AND ct.deleted_at IS NULL
            )
            AND NOT EXISTS (
                SELECT 1 FROM commande_ticket ct
                JOIN etape e ON e.id = ct.etape_id
                WHERE ct.commande_id = c.id
                AND ct.deleted_at IS NULL
                AND e.nom NOT IN ('Terminé', 'Perte')
            )"
        );

        $stmt->execute([
            'commande_id' => $commandeId,
            'utilisateur_id' => $utilisateurId
        ]);

        return $stmt->rowCount() > 0;
    }

    // La première étape du circuit (ordre le plus petit) : c'est là que démarre chaque nouveau ticket.
    // Renvoie null si la table etape est vide.
    public function premiereEtapeId(): ?int
    {
        $id = $this->pdo->query('SELECT id FROM etape ORDER BY ordre ASC LIMIT 1')->fetchColumn();

        return $id === false ? null : (int) $id;
    }

    // Crée la commande ET ses tickets d'un seul bloc.
    // $lignes = [['piece_id' => 3, 'quantite' => 2], ...] → 1 ticket par exemplaire de pièce.
    // Transaction : si un ticket échoue, la commande est annulée aussi (pas de commande vide en base).
    // Les tickets démarrent non assignés (utilisateur_id NULL) à la première étape.
    public function creerAvecTickets(string $nomClient, int $utilisateurId, array $lignes, int $etapeId): array
    {
        $this->pdo->beginTransaction();

        try {
            // date_creation et statut ('a_faire') sont remplis par les DEFAULT de la table
            $stmt = $this->pdo->prepare(
                'INSERT INTO commande (nom_client, utilisateur_id)
                 VALUES (:nom_client, :utilisateur_id)
                 RETURNING id'
            );
            $stmt->execute(['nom_client' => $nomClient, 'utilisateur_id' => $utilisateurId]);
            $commandeId = (int) $stmt->fetchColumn();

            $stmtTicket = $this->pdo->prepare(
                'INSERT INTO commande_ticket (commande_id, piece_id, etape_id)
                 VALUES (:commande_id, :piece_id, :etape_id)'
            );

            $nbTickets = 0;
            foreach ($lignes as $ligne) {
                for ($i = 0; $i < $ligne['quantite']; $i++) {
                    $stmtTicket->execute([
                        'commande_id' => $commandeId,
                        'piece_id' => $ligne['piece_id'],
                        'etape_id' => $etapeId,
                    ]);
                    $nbTickets++;
                }
            }

            $this->pdo->commit();

            return ['commande_id' => $commandeId, 'nb_tickets' => $nbTickets];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e; // le contrôleur loggue et répond 500
        }
    }
}
