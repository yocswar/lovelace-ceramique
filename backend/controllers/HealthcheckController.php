<?php
// Contrôleur pour la route /api/healthcheck

declare(strict_types=1);

namespace App\Controllers;

use App\Models\HealthcheckModel;
use App\Views\HealthcheckView;

final class HealthcheckController
{
    // Affiche un message pour vérifier que la route /api/healthcheck fonctionne.
    public function index(): void
    {
        $healthcheckView = new HealthcheckView();
        try {
            $healthcheckModel = new HealthcheckModel();
            $result = $healthcheckModel->ping();

            $healthcheckView->success($result);
        } catch (\Throwable $e) {
            $message = $e->getMessage();
            error_log($message);
            $healthcheckView->error($message);
        }
    }
}
