#!/usr/bin/env bash
# Push project to GitHub (thiva9646)
# Run once: chmod +x scripts/push-to-github.sh && ./scripts/push-to-github.sh

set -e
cd "$(dirname "$0")/.."

REPO_NAME="${1:-ecommerce-microservices}"
GITHUB_USER="thiva9646"
REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "=== Push to ${REMOTE} ==="

if [ ! -d .git ]; then
  git init
  git branch -M main
fi

git add .
git status

git commit -m "E-commerce microservices: API gateway, services, frontend, Docker, K8s" || true

if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

echo ""
echo "Pushing to GitHub..."
echo "Username: ${GITHUB_USER}"
echo "Password: use your Personal Access Token (NOT your GitHub password)"
echo ""

git push -u origin main

echo "Done! Clone on Linux:"
echo "  git clone ${REMOTE}"
