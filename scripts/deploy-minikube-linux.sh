#!/usr/bin/env bash
# Deploy to Minikube on Linux
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

command -v minikube >/dev/null || { echo "Install minikube first"; exit 1; }
command -v kubectl >/dev/null || { echo "Install kubectl first"; exit 1; }

minikube start
eval "$(minikube docker-env)"

"$ROOT/scripts/build-images.sh"
kubectl apply -k k8s/

echo "Waiting for pods..."
kubectl wait --for=condition=ready pod -l app=api-gateway -n ecommerce --timeout=300s 2>/dev/null || true
kubectl get pods -n ecommerce

echo ""
echo "Gateway URL:"
minikube service api-gateway -n ecommerce --url
