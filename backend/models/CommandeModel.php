<?php
// Modèle des commandes (tables commande + commande_ticket + lecture de piece et etape).
// Toutes les requêtes SQL de la création de commande sont ici, jamais dans le contrôleur.

declare(strict_types=1);

namespace App\Models;

use PDO;
use Throwable;

final class CommandeModel
{
    public function __construct(private PDO $pdo) {}

    // Le catalogue de pièces, pour remplir la liste déroulante du formulaire React
    public function toutesLesPieces(): array
    {
        return $this->pdo->query('SELECT id, nom FROM piece ORDER BY nom')->fetchAll();
    }

    // Vrai si TOUS les ids donnés existent dans piece (évite une erreur de clé étrangère brute)
    public function piecesExistent(array $ids): bool
    {
        $ids = array_values(array_unique($ids));
        if ($ids === []) {
            return false;
        }

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM piece WHERE id IN ($placeholders)");
        $stmt->execute($ids);

        return (int) $stmt->fetchColumn() === count($ids);
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
