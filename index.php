<?php

declare(strict_types=1);

// Charge les contrôleurs (pas d'autoload pour le moment).
require __DIR__ . '/backend/controllers/HomeController.php';
require __DIR__ . '/backend/controllers/TestController.php';
require __DIR__ . '/backend/controllers/ExampleController.php';

// Chemin demandé par le navigateur, ex. "/" ou "/test" (sans ?paramètres).
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($uri) ? $uri : '/';

// Selon le chemin, on appelle le bon contrôleur.
switch ($path) {
    case '/':
        // Page d'accueil → HomeController::index()
        $controller = new HomeController();
        $controller->index();
        break;

    case '/test':
        // Page de test → TestController::index()
        $controller = new TestController();
        $controller->index();
        break;

    case '/example':
        // Page d'exemple → ExampleController::index()
        $controller = new ExampleController();
        $controller->index();
        break;

    default:
        // Aucun case ne correspond → page introuvable
        http_response_code(404);
        echo '404 — page introuvable';
        break;
}


