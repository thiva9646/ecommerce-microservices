# E-Commerce Microservices (Learning Project)

A beginner-friendly **microservices** sample app for learning **Docker**, **Kubernetes (Minikube)**, **Node.js**, and **PHP**.

## Architecture

```
                    ┌─────────────────┐
   Client ─────────►│   API Gateway   │  Node.js :3000
                    │   (Node.js)     │
                    └────────┬────────┘
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
 ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
 │ Product Svc   │  │  Cart Svc     │  │  User Svc     │
 │ Node + Mongo  │  │  Node (mem)   │  │  PHP + MySQL  │
 └───────┬───────┘  └───────────────┘  └───────┬───────┘
         ▼                                      ▼
   ┌──────────┐                          ┌───────────────┐
   │ MongoDB  │                          │  Order Svc    │
   └──────────┘                          │  PHP + MySQL  │
                                         └───────┬───────┘
                                                 ▼
                                           ┌──────────┐
                                           │  MySQL   │
                                           └──────────┘
```

| Service | Stack | Database | Port (container) |
|---------|-------|----------|------------------|
| API Gateway | Node.js / Express | — | 3000 |
| Product Service | Node.js / Express | MongoDB | 3001 |
| Cart Service | Node.js / Express | In-memory | 3002 |
| User Service | PHP / Apache | MySQL | 80 |
| Order Service | PHP / Apache | MySQL | 80 |

No authentication — dummy data only, for local learning.

**Linux:** see [LINUX.md](LINUX.md)  
**GitHub push/pull:** see [GITHUB.md](GITHUB.md) (use a Personal Access Token, not your account password)

---

## Folder structure

```
Ecommersesite/
├── README.md
├── docker-compose.yml
├── api-gateway/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js
├── product-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js
├── cart-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js
├── user-service/
│   ├── Dockerfile
│   ├── public/index.php
│   ├── public/.htaccess
│   └── src/
├── order-service/
│   ├── Dockerfile
│   ├── public/index.php
│   ├── public/.htaccess
│   └── src/
├── mysql/init/01-schema.sql
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── mongodb-deployment.yaml
│   ├── mysql-deployment.yaml
│   ├── product-service.yaml
│   ├── cart-service.yaml
│   ├── user-service.yaml
│   ├── order-service.yaml
│   ├── api-gateway.yaml
│   └── kustomization.yaml
└── scripts/
    ├── build-images.ps1 / build-images.sh
    ├── setup-linux.sh          # Linux Docker setup
    ├── test-api.ps1 / test-api.sh
    └── deploy-minikube-linux.sh
```

---

## REST API (via Gateway)

Base URL: `http://localhost:3000` (Docker Compose) or Minikube NodePort URL.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Gateway health |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get one product |
| GET | `/api/cart/:userId` | Get cart |
| POST | `/api/cart` | Add to cart |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |
| POST | `/api/users` | Create user |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/user/:userId` | User's orders |

### Example: add to cart

```json
POST /api/cart
{
  "userId": "1",
  "productId": "<mongo-product-id>",
  "name": "Weekly Meal Kit - Classic",
  "price": 79.99,
  "quantity": 1
}
```

### Example: create order

```json
POST /api/orders
{
  "userId": 1,
  "items": [
    { "productId": "abc", "name": "Salad Bowl", "price": 12.5, "quantity": 2 }
  ]
}
```

---

## Option A — Docker Compose (easiest)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

1. Open a terminal in the project root (`Ecommersesite`).

2. Start everything:

   ```bash
   docker compose up --build
   ```

3. Wait until all services are healthy (MySQL may take ~30 seconds on first run).

4. Test:

   ```powershell
   .\scripts\test-api.ps1
   ```

   Or manually:

   ```bash
   curl http://localhost:3000/api/products
   curl http://localhost:3000/api/users
   ```

5. Stop:

   ```bash
   docker compose down
   ```

---

## Option B — Kubernetes (Minikube)

### Prerequisites

- Docker Desktop (or another container runtime)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)

### Steps

1. **Start Minikube**

   ```bash
   minikube start
   ```

2. **Use Minikube’s Docker daemon** (so built images are visible inside the cluster)

   **PowerShell:**

   ```powershell
   minikube docker-env | Invoke-Expression
   ```

   **Git Bash / WSL:**

   ```bash
   eval $(minikube docker-env)
   ```

3. **Build images**

   ```powershell
   .\scripts\build-images.ps1
   ```

4. **Deploy to namespace `ecommerce`**

   ```bash
   kubectl apply -k k8s/
   ```

5. **Wait for pods**

   ```bash
   kubectl get pods -n ecommerce -w
   ```

   MySQL and PHP services may need 1–2 minutes on first boot.

6. **Open the API Gateway (NodePort 30080)**

   ```bash
   minikube service api-gateway -n ecommerce --url
   ```

   Or get the URL manually:

   ```bash
   echo http://$(minikube ip):30080
   ```

7. **Test**

   ```powershell
   $env:GATEWAY_URL = "http://<minikube-ip>:30080"
   .\scripts\test-api.ps1
   ```

8. **Scale replicas (learning exercise)**

   ```bash
   kubectl scale deployment product-service -n ecommerce --replicas=3
   kubectl get pods -n ecommerce
   ```

9. **Clean up**

   ```bash
   kubectl delete namespace ecommerce
   minikube stop
   ```

---

## Direct service ports (Docker Compose only)

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:3000 |
| Product | http://localhost:3001/products |
| Cart | http://localhost:3002/cart/1 |
| User | http://localhost:8081/users |
| Order | http://localhost:8082/orders/user/1 |

---

## Learning notes

- **API Gateway** — one public entry; routes with `http-proxy-middleware`.
- **Microservices** — each folder is independent with its own Dockerfile.
- **MongoDB** — document store for flexible product catalog.
- **MySQL** — relational data for users and orders.
- **Cart in memory** — resets when the pod restarts; use Redis in real apps.
- **Kubernetes** — Deployments (replicas), Services (DNS names), NodePort (external access), ConfigMap/Secret (config).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `502 Backend service unavailable` | Wait for MySQL/MongoDB; check `docker compose ps` or `kubectl get pods -n ecommerce` |
| PHP services crash on start | MySQL not ready — pods retry connection automatically |
| Minikube `ImagePullBackOff` | Re-run `minikube docker-env` and rebuild images in that shell |
| Empty products in K8s | Product service seeds Mongo on first empty collection — restart product pod if needed |

---

## License

MIT — free for learning and experimentation.
