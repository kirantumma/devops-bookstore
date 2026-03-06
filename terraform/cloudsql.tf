resource "google_sql_database_instance" "postgres" {
  name             = "bookstore-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }
    disk_size         = 10
    disk_type         = "PD_SSD"
    availability_type = "ZONAL"
  }

  deletion_protection = false
  depends_on = [google_service_networking_connection.private_vpc]
}

resource "google_sql_database" "bookstore" {
  name     = "bookstore"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "bookstore_user" {
  name     = "bookstore_user"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}
