<?php
/**
 * User Service - entry point
 * Apache routes all requests here via .htaccess
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
require_once __DIR__ . '/../src/UserController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize path (strip trailing slash)
$uri = rtrim($uri, '/') ?: '/';

$db = Database::getConnection();
$controller = new UserController($db);

try {
  if ($uri === '/health') {
    echo json_encode(['status' => 'ok', 'service' => 'user-service']);
    exit;
  }

  if ($uri === '/users' && $method === 'GET') {
    $controller->listUsers();
    exit;
  }

  if (preg_match('#^/users/(\d+)$#', $uri, $m) && $method === 'GET') {
    $controller->getUser((int) $m[1]);
    exit;
  }

  if ($uri === '/users' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $controller->createUser($body);
    exit;
  }

  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'Route not found', 'path' => $uri]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
