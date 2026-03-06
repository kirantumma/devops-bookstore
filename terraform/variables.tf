variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "devops-project-489401"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
  default     = "bookstore_pass_2026"
}
