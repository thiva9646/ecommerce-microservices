<?php
/**
 * MySQL connection helper for User Service
 */

declare(strict_types=1);

class Database
{
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO
    {
        if (self::$pdo === null) {
            $host = getenv('MYSQL_HOST') ?: 'localhost';
            $port = getenv('MYSQL_PORT') ?: '3306';
            $db   = getenv('MYSQL_DATABASE') ?: 'ecommerce';
            $user = getenv('MYSQL_USER') ?: 'ecommerce';
            $pass = getenv('MYSQL_PASSWORD') ?: 'ecommerce123';

            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

            // Retry a few times — MySQL may still be starting in Docker/K8s
            $attempts = 10;
            $lastError = null;
            while ($attempts-- > 0) {
                try {
                    self::$pdo = new PDO($dsn, $user, $pass, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]);
                    break;
                } catch (PDOException $e) {
                    $lastError = $e;
                    sleep(2);
                }
            }

            if (self::$pdo === null) {
                throw $lastError ?? new RuntimeException('Could not connect to MySQL');
            }
        }

        return self::$pdo;
    }
}
