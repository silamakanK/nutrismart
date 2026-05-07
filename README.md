# NutriSmart — Génération de recettes personnalisées & analyse nutritionnelle

**NutriSmart** est une plateforme web full stack développée avec **Next.js** permettant de générer, gérer et analyser nutritionnellement des recettes personnalisées.

L'application s'appuie sur **Supabase** pour la base de données, l'authentification et le stockage, sur **OpenAI** pour la génération de recettes par IA, et est déployée sur **Kubernetes** via un cluster local **kind**, provisionné avec **Terraform**.

> Projet réalisé dans le cadre du module DevOps — EEMI 2026

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript |
| UI | Tailwind CSS |
| Base de données / Auth | Supabase (PostgreSQL + Auth + Storage) |
| IA | OpenAI API (gpt-4o-mini) |
| Conteneurisation | Docker (multi-stage build) |
| Orchestration | Kubernetes — kind (local) |
| Provisioning | Terraform |
| Tests de charge | k6 + Prometheus + Grafana |

---

## Fonctionnalités

- Authentification complète (inscription, connexion, session JWT)
- Profil utilisateur : intolérances alimentaires, objectifs nutritionnels (prise de masse, perte de poids, gain d'énergie)
- Génération de recettes par IA selon les contraintes de l'utilisateur
- Analyse nutritionnelle : calories, protéines, glucides, lipides, vitamines, minéraux
- Recherche de recettes par nom, ingrédient ou type de plat
- Liste de courses consolidée pour une sélection de recettes

---

## Installation locale (développement)

### 1. Cloner le dépôt

```bash
git clone https://github.com/silamakanK/recipes-app.git
cd recipes-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir : [http://localhost:3000](http://localhost:3000)

---

## Déploiement Kubernetes (local avec kind)

### Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [kind](https://kind.sigs.k8s.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Terraform](https://developer.hashicorp.com/terraform/install)
- [Helm](https://helm.sh/docs/intro/install/)

### 1. Créer le cluster kind

```bash
kind create cluster --name nutrismart --config kind/cluster-config.yaml
```

Le cluster est configuré avec **1 control-plane + 2 workers**.

### 2. Provisionner l'infrastructure avec Terraform

```bash
cd terraform/
terraform init
terraform apply
```

Terraform crée les namespaces, ConfigMaps et Secrets Kubernetes nécessaires.

### 3. Builder et charger l'image Docker

```bash
# Builder l'image (mode standalone Next.js)
docker build -t nutrismart-nextjs:latest .

# Charger l'image dans le cluster kind
kind load docker-image nutrismart-nextjs:latest --name nutrismart
```

> L'image n'est pas publiée sur un registry distant. Le Deployment utilise `imagePullPolicy: Never`.

### 4. Déployer les manifestes Kubernetes

```bash
kubectl apply -f k8s/
```

Cela déploie :
- Le **Deployment** Next.js (2 réplicas minimum)
- Le **Service** NodePort
- Le **Horizontal Pod Autoscaler** (HPA) — seuil CPU 60 %, max 5 pods
- Le **ConfigMap** et le **Secret** pour les variables d'environnement

### 5. Accéder à l'application

```bash
kubectl get svc -n nutrismart
```

L'application est accessible sur le port NodePort exposé (ex: `http://nutrismart.local:9080`).

---

## Monitoring (Prometheus + Grafana)

### Installer la stack de monitoring

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Accéder aux dashboards

```bash
# Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring

# Grafana
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring
```

- Prometheus : [http://localhost:9090](http://localhost:9090)
- Grafana : [http://localhost:3001](http://localhost:3001) — login `admin`

Le dashboard **NutriSmart — Tests de charge** affiche en temps réel :
- Nombre de pods actifs (HPA)
- Utilisation CPU (avec seuil à 60 %)
- Utilisation mémoire (avec limite à 256 Mo)

---

## Tests de charge (k6)

```bash
k6 run -e BASE_URL=http://nutrismart.local:9080 k6/load-test.js
```

Le script simule **50 VUs** sur **8 minutes** en montée progressive (5 stages).

Résultats observés lors du test :
- Scale-out déclenché à 68 % de CPU → montée jusqu'à 5 pods
- Pic CPU à 103–104 %
- RAM pic à ~320 Mo (limit à revoir : 256 Mo → 512 Mo)
- Scale-in propre après la charge (retour à 2 pods)

---

## Structure du projet

```
.
├── app/                  # Pages et Server Actions Next.js
├── components/           # Composants React
├── k8s/                  # Manifestes Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── configmap.yaml
│   └── secret.yaml
├── terraform/            # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── k6/                   # Scripts de test de charge
│   └── load-test.js
├── kind/                 # Configuration du cluster kind
│   └── cluster-config.yaml
├── Dockerfile            # Multi-stage build Next.js standalone
└── .env.local            # Variables d'environnement (non versionné)
```

---

## Scripts disponibles

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production local |
| `npm run lint` | Vérification du code |

---

## Sécurité

- Row Level Security (RLS) activée sur toutes les tables Supabase
- Variables sensibles gérées via **Secrets Kubernetes** (non committées)
- Séparation stricte entre logique client et serveur (Server Actions)
- `imagePullPolicy: Never` pour éviter les pulls non contrôlés

---

## Contexte pédagogique

Projet réalisé dans le cadre du module **DevOps — Kubernetes / Terraform** à l'EEMI (2026). Objectif : concevoir et déployer une plateforme applicative scalable avec autoscaling, monitoring et analyse GreenOps.
