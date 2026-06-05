<?php
/**
 * Order Service - entry point
 */

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/OrderController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$uri = rtrim($uri, '/') ?: '/';

$db = Database::getConnection();
$controller = new OrderController($db);

try {
  if ($uri === '/health') {
    echo json_encode(['status' => 'ok', 'service' => 'order-service']);
    exit;
  }

  if ($uri === '/orders' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $controller->createOrder($body);
    exit;
  }

  if (preg_match('#^/orders/user/(\d+)$#', $uri, $m) && $method === 'GET') {
    $controller->getOrdersByUser((int) $m[1]);
    exit;
  }

  if (preg_match('#^/orders/(\d+)$#', $uri, $m) && $method === 'GET') {
    $controller->getOrder((int) $m[1]);
    exit;
  }

  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'Route not found', 'path' => $uri]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
