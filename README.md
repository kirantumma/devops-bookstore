# 🚀 DevOps Bookstore — End-to-End Project on GCP

A production-grade microservices application built to demonstrate a complete DevOps lifecycle on Google Cloud Platform. This project covers everything from local development to GitOps-driven deployment with full observability.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
│   Code Push → GitHub Actions CI/CD → ArgoCD GitOps Deploy  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Artifact Registry  │
                    │  (Docker Images)    │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    GKE Cluster (4 Nodes)                     │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  book-service │  │ order-service │  │   frontend     │  │
│  │  (Flask/5000) │  │ (Express/3001)│  │ (React/Nginx)  │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬────────┘  │
│          └──────────────────┴──────────────────┘           │
│                              │                              │
│                    ┌─────────▼──────────┐                  │
│                    │   Cloud SQL (PG15)  │                  │
│                    │   Private VPC IP    │                  │
│                    └────────────────────┘                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   ArgoCD     │  │  Prometheus  │  │    Grafana      │  │
│  │  (GitOps)    │  │  (Metrics)   │  │  (Dashboards)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
devops-bookstore/
├── apps/
│   ├── book-service/          # Python Flask REST API
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   └── routes.py
│   │   ├── tests/
│   │   │   └── test_routes.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── run.py
│   ├── order-service/         # Node.js Express REST API
│   │   ├── src/
│   │   │   └── index.js
│   │   ├── tests/
│   │   │   └── order.test.js
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/              # React + Nginx
│       ├── src/
│       │   ├── App.js
│       │   └── index.js
│       ├── public/
│       ├── Dockerfile
│       └── nginx.conf
├── terraform/                 # GCP Infrastructure as Code
│   ├── main.tf
│   ├── network.tf
│   ├── gke.tf
│   ├── cloudsql.tf
│   ├── artifact-registry.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars
├── helm-charts/               # Kubernetes Deployments
│   ├── book-service/
│   ├── order-service/
│   └── frontend/
├── monitoring/                # Prometheus & Grafana config
│   └── prometheus/
│       └── servicemonitor.yaml
├── argocd/                    # ArgoCD manifests
├── .github/
│   └── workflows/
│       └── ci.yaml            # GitHub Actions pipeline
└── docker-compose.yml         # Local development
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Nginx |
| **Backend** | Python Flask, Node.js Express |
| **Database** | PostgreSQL 15 (Cloud SQL) |
| **Containers** | Docker (multi-stage builds) |
| **Orchestration** | Kubernetes (GKE 1.34) |
| **Package Manager** | Helm 3 |
| **Infrastructure** | Terraform 1.5+ |
| **CI/CD** | GitHub Actions |
| **GitOps** | ArgoCD |
| **Monitoring** | Prometheus + Grafana |
| **Registry** | Google Artifact Registry |
| **Cloud** | Google Cloud Platform (GCP) |

---

## ⚡ Quick Start — Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Run Locally

```bash
# Clone the repo
git clone https://github.com/kirantumma/devops-bookstore.git
cd devops-bookstore

# Start all services
docker-compose up --build -d

# Test the services
curl http://localhost:5000/health   # Book Service
curl http://localhost:3001/health   # Order Service

# Open UI
open http://localhost:3000
```

### Run Tests

```bash
# Book Service (Python)
cd apps/book-service
pip install -r requirements.txt pytest
pytest tests/ -v

# Order Service (Node.js)
cd apps/order-service
npm install
npm test
```

---

## ☁️ GCP Setup

### Step 1: Prerequisites

```bash
# Install tools
gcloud auth login
gcloud config set project devops-project-489401

# Enable APIs
gcloud services enable container.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com

# Authenticate for Terraform
gcloud auth application-default login
gcloud auth application-default set-quota-project devops-project-489401
```

### Step 2: Provision Infrastructure with Terraform

```bash
cd terraform

# Initialize
terraform init

# Preview changes (18 resources)
terraform plan

# Apply — creates GKE, Cloud SQL, VPC, Artifact Registry
terraform apply -auto-approve
```

**Resources Created:**
- VPC + Subnet + Cloud Router + NAT Gateway + Firewall
- GKE Cluster (`bookstore-cluster`) — 4 x e2-medium nodes
- Cloud SQL PostgreSQL 15 instance (private IP)
- Artifact Registry repository

### Step 3: Push Docker Images

```bash
# Connect to GKE
gcloud container clusters get-credentials bookstore-cluster \
  --zone us-central1-a --project devops-project-489401

# Configure Docker auth
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build and push images
docker-compose build

REGISTRY=us-central1-docker.pkg.dev/devops-project-489401/bookstore

docker tag devops-bookstore-book-service  $REGISTRY/book-service:v1
docker tag devops-bookstore-order-service $REGISTRY/order-service:v1
docker tag devops-bookstore-frontend      $REGISTRY/frontend:v1

docker push $REGISTRY/book-service:v1
docker push $REGISTRY/order-service:v1
docker push $REGISTRY/frontend:v1
```

### Step 4: Deploy to GKE with Helm

```bash
# Create namespace and database secret
kubectl create namespace bookstore
kubectl create secret generic db-credentials \
  --namespace=bookstore \
  --from-literal=url="postgresql://bookstore_user:bookstore_pass_2026@<DB_PRIVATE_IP>:5432/bookstore"

# Deploy each microservice
helm install book-service  ./helm-charts/book-service  --namespace bookstore
helm install order-service ./helm-charts/order-service --namespace bookstore
helm install frontend      ./helm-charts/frontend      --namespace bookstore

# Verify pods
kubectl get pods -n bookstore

# Get public IP
kubectl get svc frontend -n bookstore
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The pipeline runs automatically on every push to `main`:

```
Push to main
    │
    ├── test-book-service (pytest)
    ├── test-order-service (jest)
    │
    └── build-and-push (after tests pass)
            │
            ├── Authenticate via Workload Identity Federation
            ├── Build Docker images
            ├── Push to Artifact Registry
            └── Update Helm chart image tags → triggers ArgoCD
```

### Workload Identity Federation Setup

```bash
PROJECT_ID=devops-project-489401
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Create Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project=$PROJECT_ID --location="global"

# Create OIDC Provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='kirantumma/devops-bookstore'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Grant permission to service account
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/kirantumma/devops-bookstore"
```

> ✅ **No service account keys needed** — uses keyless authentication via OIDC tokens.

---

## 🔁 GitOps with ArgoCD

### Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo

# Expose UI
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc argocd-server -n argocd
```

### Create ArgoCD Applications (UI Steps)

Login to the ArgoCD UI at `https://<ARGOCD_EXTERNAL_IP>`

**Connect Repository:**
1. Settings → Repositories → Connect Repo
2. Method: HTTPS
3. URL: `https://github.com/kirantumma/devops-bookstore.git`
4. Click Connect

**Create 3 Applications** (one for each microservice):

| Field | book-service | order-service | frontend |
|-------|-------------|---------------|----------|
| App Name | `book-service` | `order-service` | `frontend` |
| Project | `default` | `default` | `default` |
| Sync Policy | Automatic | Automatic | Automatic |
| Self Heal | ✅ | ✅ | ✅ |
| Prune | ✅ | ✅ | ✅ |
| Repo URL | your repo | your repo | your repo |
| Path | `helm-charts/book-service` | `helm-charts/order-service` | `helm-charts/frontend` |
| Cluster | `https://kubernetes.default.svc` | same | same |
| Namespace | `bookstore` | `bookstore` | `bookstore` |

> **Why 3 separate apps?** Each microservice deploys independently — different teams can own deployments, rollbacks are per-service, and failures are isolated.

---

## 📊 Monitoring

### Install Prometheus + Grafana

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.retention=7d \
  --set grafana.service.type=LoadBalancer

# Get Grafana IP
kubectl get svc -n monitoring | grep grafana
```

### Grafana Dashboards

Login: `http://<GRAFANA_IP>` | user: `admin` | pass: `admin123`

**Import these dashboards:**

| Dashboard | ID | Description |
|-----------|----|-------------|
| K8S Dashboard | `15661` | Full cluster overview — nodes, pods, namespaces |
| Node Exporter | `1860` | Per-node CPU, memory, disk, network |

Pre-installed dashboards (no import needed):
- Kubernetes / Compute Resources / Cluster
- Kubernetes / Compute Resources / Namespace (Pods)
- Kubernetes / Compute Resources / Pod

---

## 🧹 Cleanup (Save GCP Credits!)

```bash
# Uninstall Helm releases
helm uninstall monitoring -n monitoring
helm uninstall book-service order-service frontend -n bookstore

# Destroy all GCP infrastructure
cd terraform
terraform destroy -auto-approve
```

> ⚠️ GKE + Cloud SQL costs ~$8-10/day. Always destroy when not in use!

---

## 🎯 Interview Talking Points

**"Walk me through your CI/CD pipeline"**
> "On every push to main, GitHub Actions runs pytest and jest tests in parallel. After both pass, it builds Docker images, pushes to GCP Artifact Registry using keyless Workload Identity Federation, updates the image tags in Helm values, and commits back. ArgoCD detects the change and auto-deploys to GKE."

**"How do you handle secrets?"**
> "Database credentials are stored as Kubernetes secrets. For GitHub Actions, I used Workload Identity Federation instead of service account keys — it's keyless and more secure, using short-lived OIDC tokens."

**"What is GitOps and how did you implement it?"**
> "GitOps means Git is the single source of truth for deployments. I set up 3 ArgoCD applications with auto-sync and self-heal enabled. If someone manually changes a Kubernetes resource, ArgoCD detects the drift and automatically reverts it to match what's in Git."

**"How do you monitor your application?"**
> "I deployed the kube-prometheus-stack via Helm, which includes Prometheus for metrics collection and Grafana for visualization. I can see all 4 nodes, 83 pods across namespaces, CPU/memory usage, and network traffic in real time."

---

## 📸 Screenshots

| Component | Description |
|-----------|-------------|
| App Running Locally | docker-compose with all 4 services healthy |
| GKE Nodes | `kubectl get nodes` — 4 nodes Ready |
| ArgoCD Dashboard | 3 apps (book-service, order-service, frontend) — Healthy & Synced |
| GitHub Actions | All 3 jobs green — test-book-service, test-order-service, build-and-push |
| Grafana K8S Dashboard | Live cluster metrics — 4 nodes, 83 pods |
| Grafana Node Exporter | Per-node CPU 18%, Memory 43%, Disk 71% |

---

## 👤 Author

**Kiran Tumma**  
GitHub: [@kirantumma](https://github.com/kirantumma)

---

## 📄 License

MIT License
