# Linux — clone, run, and deploy

Use this guide on Ubuntu, Debian, Fedora, or any Linux with Docker.

---

## 1. Install prerequisites

```bash
# Docker (Ubuntu/Debian example)
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git curl jq
sudo usermod -aG docker $USER
# Log out and back in so docker group applies

# Optional: Kubernetes
# minikube + kubectl — see https://minikube.sigs.k8s.io/docs/start/
```

---

## 2. Pull code from GitHub

Create the repo on GitHub first (see `GITHUB.md`), then on Linux:

```bash
cd ~
git clone https://github.com/thiva9646/ecommerce-microservices.git
cd ecommerce-microservices
```

If the repo name is different, use your actual URL from GitHub.

---

## 3. Run with Docker Compose

```bash
chmod +x scripts/*.sh
./scripts/setup-linux.sh
```

Or manually:

```bash
docker compose up --build -d
./scripts/test-api.sh
```

Gateway: **http://localhost:3000**

```bash
docker compose logs -f          # logs
docker compose down           # stop
```

---

## 4. Run on Minikube (optional)

```bash
./scripts/deploy-minikube-linux.sh
```

---

## 5. File permissions

If scripts are not executable after clone:

```bash
chmod +x scripts/setup-linux.sh scripts/test-api.sh scripts/build-images.sh scripts/deploy-minikube-linux.sh
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `permission denied` on docker | `sudo usermod -aG docker $USER` then re-login |
| Port 3000 in use | Change api-gateway port in `docker-compose.yml` |
| MySQL not ready | Wait 30–60s, then `docker compose restart user-service order-service` |
