#!/usr/bin/env bash
# Build all Docker images (use inside Minikube Docker daemon for K8s)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building microservice images..."
docker build -t api-gateway:latest "$ROOT/api-gateway"
docker build -t product-service:latest "$ROOT/product-service"
docker build -t cart-service:latest "$ROOT/cart-service"
docker build -t user-service:latest "$ROOT/user-service"
docker build -t order-service:latest "$ROOT/order-service"
echo "Done."
