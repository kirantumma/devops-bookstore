resource "google_artifact_registry_repository" "bookstore" {
  location      = var.region
  repository_id = "bookstore"
  description   = "Docker images for Bookstore microservices"
  format        = "DOCKER"
  depends_on = [google_project_service.apis]
}
