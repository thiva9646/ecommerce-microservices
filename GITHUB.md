# Push to GitHub & pull on Linux

**Security:** Do not put passwords in code, scripts, or chat. GitHub does **not** accept your account password for `git push` anymore. Use a **Personal Access Token (PAT)** or **SSH key**.

If you shared your GitHub password anywhere, **change it now**: GitHub → Settings → Password.

---

## Step 1 — Create repository on GitHub

1. Log in: https://github.com (username: `thiva9646`)
2. Click **+** → **New repository**
3. Name: `ecommerce-microservices` (or any name you prefer)
4. **Public**, do **not** add README (this project already has one)
5. Click **Create repository**

---

## Step 2 — Create a Personal Access Token (one time)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Note: `ecommerce-push`, scope: **repo**
4. Copy the token (starts with `ghp_`) — you will not see it again

Use this token **instead of your password** when Git asks for a password.

---

## Step 3 — Push from Windows (first time)

Open **Git Bash** or a terminal where `git` is installed:

```bash
cd t:/VM/Ecommersesite

git init
git add .
git commit -m "Initial commit: e-commerce microservices learning project"

git branch -M main
git remote add origin https://github.com/thiva9646/ecommerce-microservices.git

git push -u origin main
```

When prompted:

- **Username:** `thiva9646`
- **Password:** paste your **PAT** (not your GitHub account password)

### Alternative: GitHub CLI

```bash
gh auth login
gh repo create ecommerce-microservices --public --source=. --push
```

---

## Step 4 — Pull on Linux

```bash
sudo apt install -y git docker.io docker-compose-plugin
git clone https://github.com/thiva9646/ecommerce-microservices.git
cd ecommerce-microservices
chmod +x scripts/*.sh
./scripts/setup-linux.sh
```

For private repos, use PAT when cloning:

```bash
git clone https://thiva9646@github.com/thiva9646/ecommerce-microservices.git
# Password prompt → paste PAT
```

Or use SSH (recommended for Linux servers):

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Add key at GitHub → Settings → SSH keys
git clone git@github.com:thiva9646/ecommerce-microservices.git
```

---

## Daily workflow

**Windows (after changes):**

```bash
git add .
git commit -m "Describe your change"
git push
```

**Linux (get latest):**

```bash
cd ~/ecommerce-microservices
git pull
docker compose up --build -d
```

---

## What must NEVER be committed

- Passwords or PAT tokens
- `.env` files with secrets
- `node_modules/`

This repo’s `.gitignore` already excludes `node_modules` and `.env`.
