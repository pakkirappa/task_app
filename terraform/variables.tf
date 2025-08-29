variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
  
  validation {
    condition = can(regex("^db-", var.db_tier))
    error_message = "DB tier must start with 'db-'."
  }
}

variable "deploy_frontend_to_cloud_run" {
  description = "Whether to deploy frontend to Cloud Run (set to false to deploy to Vercel)"
  type        = bool
  default     = false
}
