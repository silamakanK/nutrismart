#!/usr/bin/env bash
# Script de déploiement complet NutriSmart sur kind (local)
set -euo pipefail

IMAGE_NAME="nutrismart-nextjs"
IMAGE_TAG="latest"
CLUSTER_NAME="nutrismart"

echo "==> [1/5] Build de l'image Docker"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

echo "==> [2/5] Provisioning du cluster via Terraform"
cd terraform
terraform init -upgrade
terraform apply -auto-approve
cd ..

echo "==> [3/5] Chargement de l'image dans kind"
kind load docker-image "${IMAGE_NAME}:${IMAGE_TAG}" --name "${CLUSTER_NAME}"

echo "==> [4/5] Injection des secrets réels depuis .env.local"
export KUBECONFIG="$(kind get kubeconfig-path --name=${CLUSTER_NAME} 2>/dev/null || echo ~/.kube/config)"
kubectl create secret generic nutrismart-secret \
  --from-env-file=.env.local \
  --namespace=nutrismart \
  --dry-run=client -o yaml | kubectl apply -f -

echo "==> [5/5] Vérification du déploiement"
kubectl rollout status deployment/nutrismart-nextjs -n nutrismart --timeout=120s
kubectl get pods -n nutrismart
kubectl get hpa  -n nutrismart

echo ""
echo "Application disponible sur : http://nutrismart.local:8080"
echo "Ajoutez cette ligne dans /etc/hosts si ce n'est pas déjà fait :"
echo "  127.0.0.1  nutrismart.local"
