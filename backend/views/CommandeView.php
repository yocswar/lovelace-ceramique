<?php
// Vue des commandes : seul endroit qui fabrique les réponses JSON de la création de commande.

declare(strict_types=1);

namespace App\Views;

final class CommandeView
{
    // 201 = « créé » : la commande et ses tickets existent maintenant en base
    public function creee(int $commandeId, int $nbTickets): void
    {
        $this->send(201, [
            'status' => 'ok',
            'message' => 'Commande créée avec ' . $nbTickets . ' pièce(s) à fabriquer',
            'commande_id' => $commandeId,
            'nb_tickets' => $nbTickets,
        ]);
    }

    public function error(int $code, string $message): void
    {
        $this->send($code, ['status' => 'error', 'message' => $message]);
    }

    private function send(int $code, array $body): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
    }
}
