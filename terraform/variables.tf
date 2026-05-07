variable "cluster_name" {
  description = "Nom du cluster kind"
  type        = string
  default     = "nutrismart"
}

variable "namespace" {
  description = "Namespace Kubernetes cible"
  type        = string
  default     = "nutrismart"
}

variable "nextjs_image" {
  description = "Image Docker de l'application Next.js"
  type        = string
  default     = "nutrismart-nextjs:latest"
}

variable "nextjs_replicas" {
  description = "Nombre de réplicas initial pour le déploiement Next.js"
  type        = number
  default     = 2
}
