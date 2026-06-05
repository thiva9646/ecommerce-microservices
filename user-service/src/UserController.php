<?php
/**
 * User API handlers
 */

declare(strict_types=1);

class UserController
{
    public function __construct(private PDO $db) {}

    public function listUsers(): void
    {
        $stmt = $this->db->query('SELECT id, name, email, created_at FROM users ORDER BY id');
        $users = $stmt->fetchAll();
        echo json_encode(['success' => true, 'count' => count($users), 'data' => $users]);
    }

    public function getUser(int $id): void
    {
        $stmt = $this->db->prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found']);
            return;
        }

        echo json_encode(['success' => true, 'data' => $user]);
    }

    public function createUser(array $body): void
    {
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');

        if ($name === '' || $email === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'name and email are required']);
            return;
        }

        $stmt = $this->db->prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        $stmt->execute([$name, $email]);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User created',
            'data' => ['id' => (int) $this->db->lastInsertId(), 'name' => $name, 'email' => $email],
        ]);
    }
}
