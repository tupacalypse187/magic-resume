# Deployment Guide

Magic Resume ships as a **stateless** container (all resume data lives in the browser's `localStorage`; filesystem sync is browser-side via the File System Access API). That makes it straightforward to host anywhere — no database, no persistent volume required.

A prebuilt image is published to Docker Hub:

```
tupacalypse187/magic-resume
```

---

## 🏷️ Tag structure

| Tag | Purpose | Mutability |
|------|---------|-----------|
| `2.0.6-ai` | Semantic version + `-ai` denotes the AI-enhanced build (vs vanilla upstream) | mutable per major |
| `2.0.6-ai-<git-sha>` | Version + commit short SHA — **immutable, reproducible** | immutable |
| `latest` | Rolling pointer to newest build | mutable |

**Pin production deploys to the version tag** (`2.0.6-ai` or the `-<git-sha>` variant), not `latest`, so node pulls are reproducible.

---

## 🔐 Security notes

- The published image contains **only** `dist/`, `node_modules`, `package.json`, and `server.mjs`. The `ai-config.json` file (which holds API keys) is **never baked into the image** — it is injected at runtime via a mount.
- The image is therefore safe to publish to a public registry. Anyone who pulls it gets no secrets.
- `ai-config.json` only holds the **default** provider keys shown on first load; users always enter their own keys in the browser, which are sent in the request body (never stored server-side).

---

## 🐳 Run with plain Docker

```bash
docker run -d \
  --name magic-resume \
  -p 3000:3000 \
  -v "$PWD/ai-config.json:/app/ai-config.json:ro" \
  --restart always \
  tupacalypse187/magic-resume:2.0.6-ai
```

Then open `http://<host>:3000`.

---

## ☸️ Deploy on MicroK8s (aix1pro)

### 1. Enable required add-ons (once)

```bash
ssh aix1pro
sudo microk8s enable ingress dns
```

### 2. Create the namespace and the ai-config Secret

The Secret carries your default provider keys. Create it from your local `ai-config.json` so the keys never get committed:

```bash
# Copy the config to aix1pro first (it is gitignored), then:
microk8s kubectl create namespace magic-resume
microk8s kubectl -n magic-resume create secret generic ai-config \
  --from-file=ai-config.json=./ai-config.json
```

> ⚠️ Do **not** commit `ai-config.json` or a Secret manifest containing real keys. The file is in `.gitignore`.

### 3. Apply the manifests

```bash
microk8s kubectl apply -f deploy/k8s/
```

This creates the Namespace, Deployment, Service, and Ingress.

### 4. Point DNS at the node

Create an A record for your chosen hostname (default in `ingress.yaml`: `magic-resume.yantorno.party`) pointing at aix1pro's public IP.

### 5. Verify

```bash
microk8s kubectl -n magic-resume get pods,svc,ingress
microk8s kubectl -n magic-resume logs deployment/magic-resume --tail=20
```

Once DNS propagates, open `http://magic-resume.yantorno.party`.

---

## 🔒 TLS (HTTPS)

The base ingress serves HTTP. For HTTPS, the simplest path on MicroK8s:

```bash
sudo microk8s enable cert-manager ingress
```

Then add a TLS block to `deploy/k8s/ingress.yaml` (a commented template is included) and annotate for cert-manager to issue a Let's Encrypt cert. See the [microk8s cert-manager docs](https://microk8s.io/docs/addon-cert-manager).

---

## 🔄 Updating the deployment (GitOps via ArgoCD)

Production is managed by ArgoCD, which syncs these manifests from the Git repo. The image tag is pinned to an immutable `version-commit` tag, so the full release flow is:

1. **Verify locally** — `docker compose up -d --build web`, test at `http://localhost:3000`.
2. **Publish the new image** to Docker Hub (see "Publishing a new image" below).
3. **Bump the pinned tag** in `deploy/k8s/deployment.yaml` to the new `version-commit` tag.
4. **Commit and push** to GitHub.
5. **ArgoCD syncs** the manifest automatically and rolls out the new pod. No manual `kubectl rollout` needed.

Verify on the cluster if desired:

```bash
microk8s kubectl -n magic-resume rollout status deployment/magic-resume
microk8s kubectl -n magic-resume get pods -w
```

> Convention: the `image:` tag is always the immutable `<version>-<git-sha>` form (e.g. `2.0.6-ai-5474fcd`). Never point production at `latest`.

---

## 📦 Publishing a new image (maintainer)

From the repo root, after `docker compose up -d --build web`:

```bash
# Replace VERSION and SHA with the new values
VERSION=2.0.6-ai
SHA=$(git rev-parse --short HEAD)

docker tag magic-resume-web:latest tupacalypse187/magic-resume:${VERSION}
docker tag magic-resume-web:latest tupacalypse187/magic-resume:${VERSION}-${SHA}
docker tag magic-resume-web:latest tupacalypse187/magic-resume:latest

docker push tupacalypse187/magic-resume:${VERSION}
docker push tupacalypse187/magic-resume:${VERSION}-${SHA}
docker push tupacalypse187/magic-resume:latest
```

All three tags share one image digest, so layers upload only once.

### Verify no secrets leaked before pushing

```bash
docker run --rm tupacalypse187/magic-resume:${VERSION} \
  sh -c "ls -la /app && echo '---'; find /app -name 'ai-config*' 2>/dev/null"
```

You should see only `dist/`, `node_modules`, `package.json`, `server.mjs` — **no** `ai-config.json`.
