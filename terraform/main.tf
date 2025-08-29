terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Generate random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Generate random JWT secret
resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = true
  disable_on_destroy         = false
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "taskapp" {
  repository_id = "taskapp"
  format        = "DOCKER"
  location      = var.region
  description   = "Task App container repository"

  depends_on = [google_project_service.apis]
}

# Cloud SQL instance
resource "google_sql_database_instance" "taskapp" {
  name             = "taskapp-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier                        = var.db_tier
    deletion_protection_enabled = var.environment == "production" ? true : false
    
    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    maintenance_window {
      day          = 7  # Sunday
      hour         = 4  # 4 AM
      update_track = "stable"
    }
  }

  depends_on = [
    google_project_service.apis,
    google_service_networking_connection.private_vpc_connection
  ]
}

# Cloud SQL database
resource "google_sql_database" "taskapp" {
  name     = "taskapp"
  instance = google_sql_database_instance.taskapp.name
}

# Cloud SQL user
resource "google_sql_user" "taskapp" {
  name     = "taskapp"
  instance = google_sql_database_instance.taskapp.name
  password = random_password.db_password.result
}

# VPC for private networking
resource "google_compute_network" "vpc" {
  name                    = "taskapp-vpc-${var.environment}"
  auto_create_subnetworks = false
}

# Subnet for Cloud SQL
resource "google_compute_subnetwork" "subnet" {
  name          = "taskapp-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.vpc.id
  region        = var.region
}

# Private IP range for Cloud SQL
resource "google_compute_global_address" "private_ip_range" {
  name          = "taskapp-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

# Private connection for Cloud SQL
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

# Secret Manager secrets
resource "google_secret_manager_secret" "db_url" {
  secret_id = "taskapp-db-url-${var.environment}"
  
  replication {
    automatic = true
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_url" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = "postgresql://${google_sql_user.taskapp.name}:${google_sql_user.taskapp.password}@${google_sql_database_instance.taskapp.private_ip_address}:5432/${google_sql_database.taskapp.name}?sslmode=require"
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "taskapp-jwt-secret-${var.environment}"
  
  replication {
    automatic = true
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

# IAM service account for Cloud Run
resource "google_service_account" "cloudrun_service_account" {
  account_id   = "taskapp-cloudrun-${var.environment}"
  display_name = "Task App Cloud Run Service Account (${var.environment})"
  description  = "Service account for Task App Cloud Run service"
}

# IAM bindings for service account
resource "google_project_iam_member" "cloudrun_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "db_url_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.db_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "jwt_secret_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_service_account.email}"
}

# Cloud Run backend service
resource "google_cloud_run_service" "backend" {
  name     = "taskapp-backend-${var.environment}"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
        "autoscaling.knative.dev/minScale" = "1"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.taskapp.connection_name
        "run.googleapis.com/cpu-throttling" = "false"
      }
    }

    spec {
      service_account_name = google_service_account.cloudrun_service_account.email
      container_concurrency = 80
      timeout_seconds = 300

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.taskapp.repository_id}/taskapp-backend:latest"
        
        ports {
          container_port = 8000
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "PORT"
          value = "8000"
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_url.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name  = "CORS_ORIGIN"
          value = var.environment == "production" ? "https://taskapp-frontend-${var.environment}-${random_id.suffix.hex}-uc.a.run.app" : "*"
        }

        startup_probe {
          http_get {
            path = "/health"
            port = 8000
          }
          initial_delay_seconds = 10
          timeout_seconds = 5
          period_seconds = 10
          failure_threshold = 3
        }

        liveness_probe {
          http_get {
            path = "/health"
            port = 8000
          }
          initial_delay_seconds = 30
          timeout_seconds = 5
          period_seconds = 30
          failure_threshold = 3
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.apis]
}

# Cloud Run frontend service (optional)
resource "google_cloud_run_service" "frontend" {
  count    = var.deploy_frontend_to_cloud_run ? 1 : 0
  name     = "taskapp-frontend-${var.environment}"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
        "autoscaling.knative.dev/minScale" = "0"
      }
    }

    spec {
      container_concurrency = 100
      timeout_seconds = 60

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.taskapp.repository_id}/taskapp-frontend:latest"
        
        ports {
          container_port = 3000
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = "${google_cloud_run_service.backend.status[0].url}/api"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.apis]
}

# Random suffix for unique naming
resource "random_id" "suffix" {
  byte_length = 4
}

# IAM policy for public access to Cloud Run services
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "backend_noauth" {
  location = google_cloud_run_service.backend.location
  project  = google_cloud_run_service.backend.project
  service  = google_cloud_run_service.backend.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "frontend_noauth" {
  count    = var.deploy_frontend_to_cloud_run ? 1 : 0
  location = google_cloud_run_service.frontend[0].location
  project  = google_cloud_run_service.frontend[0].project
  service  = google_cloud_run_service.frontend[0].name

  policy_data = data.google_iam_policy.noauth.policy_data
}
