<?php
// Lecture du token JWT émis par AuthController : partagé par tous les contrôleurs protégés.

declare(strict_types=1);

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

final class JwtAuth
{
    // Lit le header « Authorization: Bearer <token> » et décode le JWT.
    // Renvoie les claims (sub, identifiant, role…) ou null si le token est absent, invalide ou expiré.
    public static function utilisateurConnecte(): ?array
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
