<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

// Accès à la table utilisateur (requêtes SQL uniquement)
final class UtilisateurModel
{
    public function __construct(
        private PDO $pdo,
    ) {}

    // Crée un utilisateur et renvoie son id
    public function creer(
        string $identifiant,
        string $mdpHash,
        string $email,
        string $nom,
        int $organisationId,
        string $role,
    ): int {
        $stmt = $this->pdo->prepare(
            'INSERT INTO utilisateur (identifiant, mdp, email, nom, organisation_id, role)
            VALUES (:identifiant, :mdp, :email, :nom, :organisation_id, :role)
            RETURNING id'
        );
        $stmt->execute([
            'identifiant' => $identifiant,
            'mdp' => $mdpHash,
            'email' => $email,
            'nom' => $nom,
            'organisation_id' => $organisationId,
            'role' => $role,
        ]);

        return (int) $stmt->fetchColumn();
    }

    public function identifiantExiste(string $identifiant): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM utilisateur WHERE identifiant = :identifiant LIMIT 1'
        );
        $stmt->execute(['identifiant' => $identifiant]);

        return $stmt->fetchColumn() !== false;
    }

    public function emailExiste(string $email): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM utilisateur WHERE email = :email LIMIT 1'
        );
        $stmt->execute(['email' => $email]);

        return $stmt->fetchColumn() !== false;
    }

    public function trouverParIdentifiant(string $identifiant): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, identifiant, mdp, email, nom, role, organisation_id
            FROM utilisateur
            WHERE identifiant = :identifiant
            LIMIT 1'
        );
        $stmt->execute(['identifiant' => $identifiant]);

        $ligne = $stmt->fetch();

        if ($ligne === false) {
            return null;
        }

        return $ligne;
    }

    public function trouverParId(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, role, organisation_id
            FROM utilisateur
            WHERE id = :id'
        );
        $stmt->execute(['id' => $id]);

        $ligne = $stmt->fetch();

        if ($ligne === false) {
            return null;
        }

        return $ligne;
    }
    // Liste les utilisateurs de la même organisation que le compte connecté.
    public function listerPourUtilisateur(int $idConnecte): array
    {
        $sql = "SELECT u.id, u.nom
                FROM utilisateur u
                JOIN utilisateur connecte
                    ON u.organisation_id = connecte.organisation_id
                WHERE connecte.id = :id
                ORDER BY u.nom";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $idConnecte]);

        return $stmt->fetchAll();
    }
}
