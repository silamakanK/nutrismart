terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.5"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# -------------------------------------------------------------------
# 1. Cluster kind (Kubernetes IN Docker) — déploiement local sans cloud
# -------------------------------------------------------------------
resource "kind_cluster" "nutrismart" {
  name            = var.cluster_name
  wait_for_ready  = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
      # Port mapping pour accéder à l'Ingress depuis la machine hôte
      extra_port_mappings {
        container_port = 80
        host_port      = 9080
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 443
        host_port      = 8443
        protocol       = "TCP"
      }
      # Tolère le scheduling des pods sur le nœud control-plane (cluster mono-nœud)
      kubeadm_config_patches = [
        "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
      ]
    }
  }
}

# -------------------------------------------------------------------
# 2. Providers Helm et Kubernetes — pointent vers le cluster kind
# -------------------------------------------------------------------
provider "helm" {
  kubernetes {
    host                   = kind_cluster.nutrismart.endpoint
    cluster_ca_certificate = kind_cluster.nutrismart.cluster_ca_certificate
    client_certificate     = kind_cluster.nutrismart.client_certificate
    client_key             = kind_cluster.nutrismart.client_key
  }
}

provider "kubernetes" {
  host                   = kind_cluster.nutrismart.endpoint
  cluster_ca_certificate = kind_cluster.nutrismart.cluster_ca_certificate
  client_certificate     = kind_cluster.nutrismart.client_certificate
  client_key             = kind_cluster.nutrismart.client_key
}

# -------------------------------------------------------------------
# 3. Metrics Server — requis pour le Horizontal Pod Autoscaler
# -------------------------------------------------------------------
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  namespace  = "kube-system"

  # kind utilise des certificats auto-signés : désactivation TLS pour le scraping
  set {
    name  = "args[0]"
    value = "--kubelet-insecure-tls"
  }

  depends_on = [kind_cluster.nutrismart]
}

# -------------------------------------------------------------------
# 4. Nginx Ingress Controller — point d'entrée HTTP unique vers les services
# -------------------------------------------------------------------
resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true

  values = [
    <<-EOT
    controller:
      hostPort:
        enabled: true
      service:
        type: NodePort
      nodeSelector:
        ingress-ready: "true"
    EOT
  ]

  depends_on = [kind_cluster.nutrismart]
}

# -------------------------------------------------------------------
# 5. Application des manifests Kubernetes via kubectl
#    (namespace, ConfigMap, Secret, PVC, StatefulSet, Deployment, HPA, Ingress)
# -------------------------------------------------------------------
resource "null_resource" "apply_manifests" {
  triggers = {
    cluster_id = kind_cluster.nutrismart.id
  }

  provisioner "local-exec" {
    command = <<-EOT
      export KUBECONFIG=${kind_cluster.nutrismart.kubeconfig_path}
      kubectl apply -f ${path.module}/../k8s/00-namespace.yaml
      kubectl apply -f ${path.module}/../k8s/01-configmap.yaml
      # Le secret doit être créé manuellement avec les vraies valeurs :
      # kubectl create secret generic nutrismart-secret \
      #   --from-env-file=.env.local -n nutrismart
      kubectl apply -f ${path.module}/../k8s/03-postgres-pvc.yaml
      kubectl apply -f ${path.module}/../k8s/04-postgres-statefulset.yaml
      kubectl apply -f ${path.module}/../k8s/05-postgres-service.yaml
      kubectl apply -f ${path.module}/../k8s/06-nextjs-deployment.yaml
      kubectl apply -f ${path.module}/../k8s/07-nextjs-service.yaml
      kubectl apply -f ${path.module}/../k8s/08-nextjs-hpa.yaml
      kubectl apply -f ${path.module}/../k8s/09-ingress.yaml
    EOT
  }

  depends_on = [
    helm_release.metrics_server,
    helm_release.ingress_nginx,
  ]
}
