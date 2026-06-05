#!/usr/bin/env bash
# =============================================================================
# Linux setup — E-commerce microservices (Docker Compose)
# Run from project root after: git clone <your-repo-url>
#   chmod +x scripts/*.sh
#   ./scripts/setup-linux.sh
# =============================================================================
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== E-commerce microservices — Linux setup ==="

# Check Docker
if ! command -v docker &>/dev/null; then
  echo "Docker not found. Install Docker Engine:"
  echo "  https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker compose version &>/dev/null 2>&1; then
  echo "Docker Compose plugin not found. Install docker-compose-plugin."
  exit 1
fi

echo "Building and starting services..."
docker compose up --build -d

echo ""
echo "Waiting for MySQL (up to 60s)..."
for i in $(seq 1 30); do
  if docker compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo "MySQL is ready."
    break
  fi
  sleep 2
done

echo ""
echo "=== Ready ==="
echo "API Gateway: http://localhost:3000"
echo "Test APIs:   ./scripts/test-api.sh"
echo "View logs:   docker compose logs -f"
echo "Stop:        docker compose down"
