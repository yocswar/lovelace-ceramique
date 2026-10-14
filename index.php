<?php

declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');

echo '<h1>Lovelace Céramique — test PHP</h1>';
echo '<p>Version PHP : ' . PHP_VERSION . '</p>';

/** @var PDO $pdo */
$pdo = require __DIR__ . '/config/db.php';
$pdo->query('SELECT 1');

echo '<p style="color: green;">Connexion PostgreSQL OK</p>';
