output "cluster_name" {
  description = "Nom du cluster kind créé"
  value       = kind_cluster.nutrismart.name
}

output "kubeconfig_path" {
  description = "Chemin vers le fichier kubeconfig"
  value       = kind_cluster.nutrismart.kubeconfig_path
}

output "cluster_endpoint" {
  description = "Endpoint API du cluster"
  value       = kind_cluster.nutrismart.endpoint
  sensitive   = true
}

output "app_url" {
  description = "URL d'accès à NutriSmart (après ajout dans /etc/hosts)"
  value       = "http://nutrismart.local:8080"
}
