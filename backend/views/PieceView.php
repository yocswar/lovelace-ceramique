<?php
// Vue des pièces : seul endroit qui fabrique les réponses JSON du catalogue de pièces.

declare(strict_types=1);

namespace App\Views;

final class PieceView
{
    // La liste des pièces du catalogue
    public function liste(array $pieces): void
    {
        $this->send(200, ['status' => 'ok', 'pieces' => $pieces]);
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
