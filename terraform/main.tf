terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "apis" {
  for_each = toset([
    "container.googleapis.com",
    "artifactregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
  ])
  project = var.project_id
  service = each.value

  disable_dependent_services = false
  disable_on_destroy         = false
}
