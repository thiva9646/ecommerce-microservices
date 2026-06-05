<?php
/**
 * Order API handlers
 */

declare(strict_types=1);

class OrderController
{
    public function __construct(private PDO $db) {}

  /**
   * Create order from JSON body:
   * { "userId": 1, "items": [{ "productId": "...", "name": "...", "price": 10, "quantity": 2 }] }
   */
    public function createOrder(array $body): void
    {
        $userId = (int) ($body['userId'] ?? 0);
        $items = $body['items'] ?? [];

        if ($userId < 1 || !is_array($items) || count($items) === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'userId and items[] are required']);
            return;
        }

        $total = 0.0;
        foreach ($items as $item) {
            $price = (float) ($item['price'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);
            $total += $price * $qty;
        }

        $itemsJson = json_encode($items);

        $stmt = $this->db->prepare(
            'INSERT INTO orders (user_id, total, items_json, status) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $total, $itemsJson, 'pending']);

        $orderId = (int) $this->db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Order created',
            'data' => [
                'id' => $orderId,
                'userId' => $userId,
                'total' => round($total, 2),
                'status' => 'pending',
                'items' => $items,
            ],
        ]);
    }

    public function getOrdersByUser(int $userId): void
    {
        $stmt = $this->db->prepare(
            'SELECT id, user_id, total, items_json, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC'
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        $orders = array_map(fn ($row) => $this->formatOrder($row), $rows);

        echo json_encode(['success' => true, 'count' => count($orders), 'data' => $orders]);
    }

    public function getOrder(int $id): void
    {
        $stmt = $this->db->prepare(
            'SELECT id, user_id, total, items_json, status, created_at FROM orders WHERE id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Order not found']);
            return;
        }

        echo json_encode(['success' => true, 'data' => $this->formatOrder($row)]);
    }

    private function formatOrder(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'userId' => (int) $row['user_id'],
            'total' => (float) $row['total'],
            'status' => $row['status'],
            'items' => json_decode($row['items_json'], true),
            'createdAt' => $row['created_at'],
        ];
    }
}
