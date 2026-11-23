<?php

declare(strict_types=1);

namespace App\Services;

final class UtilisateurValidator
{
    /**
     * Valide les données de l'organisation et de son administrateur
     *
     * @return list<string> Messages d'erreur ou liste vide si les données sont valides
     */
    public function valider(
        string $organisationNom,
        string $identifiant,
        string $mdp,
        string $email,
        string $nom,
    ): array {
        $erreurs = [];

        // Vérifie le nom de la nouvelle organisation
        if ($organisationNom === '' || mb_strlen($organisationNom) > 50) {
            $erreurs[] = 'Le nom de l\'organisation est obligatoire (max. 50 caractères)';
        }

        // Vérifie les informations du compte administrateur associé
        $erreursUtilisateur = $this->validerUtilisateur(
            $identifiant,
            $mdp,
            $email,
            $nom,
        );

        return array_merge($erreurs, $erreursUtilisateur);
    }

    /**
     * Valide les informations communes aux administrateurs et collaborateurs
     *
     * @return list<string> Messages d'erreur ou liste vide si les données sont valides
     */
    public function validerUtilisateur(
        string $identifiant,
        string $mdp,
        string $email,
        string $nom,
    ): array {
        $erreurs = [];

        if ($identifiant === '' || mb_strlen($identifiant) > 25) {
            $erreurs[] = 'L\'identifiant est obligatoire (max. 25 caractères)';
        }

        if (mb_strlen($mdp) < 8) {
            $erreurs[] = 'Le mot de passe doit contenir au moins 8 caractères';
        }

        if (
            !filter_var($email, FILTER_VALIDATE_EMAIL)
            || mb_strlen($email) > 120
        ) {
            $erreurs[] = 'L\'email est invalide';
        }

        if ($nom === '' || mb_strlen($nom) > 50) {
            $erreurs[] = 'Le nom est obligatoire (max. 50 caractères)';
        }

        return $erreurs;
    }
}