<?php
// Modèle des pièces (table piece) : le catalogue des objets que l'atelier sait fabriquer.
// Toutes les requêtes SQL sur les pièces sont ici, jamais dans le contrôleur.

declare(strict_types=1);

namespace App\Models;

use PDO;

final class PieceModel
{
    public function __construct(private PDO $pdo) {}

    // Le catalogue complet, trié par nom (liste déroulante du formulaire de commande)
    public function findAll(): array
    {
        return $this->pdo->query('SELECT id, nom FROM piece ORDER BY nom')->fetchAll();
    }

    // Vrai si TOUS les ids donnés existent dans piece (évite une erreur de clé étrangère brute)
    public function tousExistent(array $ids): bool
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
}
