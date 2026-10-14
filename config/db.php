<?php

declare(strict_types=1);

$host = getenv('DB_HOST') ?: 'postgres';
$port = getenv('DB_PORT') ?: '5432';
$dbname = getenv('DB_NAME') ?: 'lovelace';
$user = getenv('DB_USER') ?: 'lovelace';
// $password = getenv('DB_PASSWORD') ?: 'lovelace';
$password = getenv('DB_PASSWORD');

if ($password === false || $password === '') {
    throw new RuntimeException(
        'La variable de entorno DB_PASSWORD no está configurada.'
    );
}

$dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";

try {
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    echo '<p style="color: red;">Connexion PostgreSQL échouée</p>';
    echo '<pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
    exit;
}

return $pdo;
