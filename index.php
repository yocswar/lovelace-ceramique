<?php

declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');

echo '<h1>Lovelace Céramique — test PHP</h1>';
echo '<p>Version PHP : ' . PHP_VERSION . '</p>';

/** @var PDO $pdo */
$pdo = require __DIR__ . '/config/db.php';
$pdo->query('SELECT 1');

class Exemple {
    public string $message;

    public function __construct(string $message){
        $this->message = $message;
    }

    public function afficher(): void {
        echo '<p style="color: blue;">' . $this->message . '</p>';
    }

    public function goodBye(): void {
        echo '<p style="color: red;">Au revoir, monde !</p>';
    }
}

$exemple = new Exemple('Bonjour, monde !');
$exemple->afficher(); // Affiche "Bonjour, monde !"
$exemple->goodBye(); // Affiche "Au revoir, monde !"

echo '<p style="color: green;">Connexion PostgreSQL OK</p>';
echo __DIR__;
