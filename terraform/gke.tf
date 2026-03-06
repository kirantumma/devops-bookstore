resource "google_container_cluster" "primary" {
  name     = "bookstore-cluster"
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  network_policy {
    enabled = true
  }

  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"

  depends_on = [
    google_project_service.apis,
    google_compute_subnetwork.subnet,
  ]
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "bookstore-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  node_count = 2

  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 30
    disk_type    = "pd-standard"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      env     = "dev"
      project = "bookstore"
    }

    tags = ["bookstore-node"]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
