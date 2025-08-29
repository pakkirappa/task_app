output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository for container images"
  value       = google_artifact_registry_repository.taskapp.name
}

output "backend_cloud_run_url" {
  description = "Backend Cloud Run service URL"
  value       = google_cloud_run_service.backend.status[0].url
}

output "frontend_cloud_run_url" {
  description = "Frontend Cloud Run service URL (if deployed)"
  value       = var.deploy_frontend_to_cloud_run ? google_cloud_run_service.frontend[0].status[0].url : null
}

output "database_connection_name" {
  description = "Cloud SQL database connection name"
  value       = google_sql_database_instance.taskapp.connection_name
  sensitive   = true
}

output "database_private_ip" {
  description = "Cloud SQL database private IP address"
  value       = google_sql_database_instance.taskapp.private_ip_address
  sensitive   = true
}

output "database_public_ip" {
  description = "Cloud SQL database public IP address"
  value       = google_sql_database_instance.taskapp.public_ip_address
  sensitive   = true
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloudrun_service_account.email
}

output "db_url_secret_name" {
  description = "Secret Manager secret name for database URL"
  value       = google_secret_manager_secret.db_url.secret_id
  sensitive   = true
}

output "jwt_secret_secret_name" {
  description = "Secret Manager secret name for JWT secret"
  value       = google_secret_manager_secret.jwt_secret.secret_id
  sensitive   = true
}

output "vpc_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.subnet.name
}

# Instructions for deployment
output "deployment_instructions" {
  description = "Instructions for deploying the application"
  value = <<-EOF
    
    🚀 Infrastructure deployed successfully! 
    
    Next steps to deploy your application:
    
    1. Build and push backend image:
       cd backend
       docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.taskapp.repository_id}/taskapp-backend:latest .
       docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.taskapp.repository_id}/taskapp-backend:latest
    
    2. Run database migrations:
       # Connect to Cloud SQL and run migrations
       gcloud sql connect ${google_sql_database_instance.taskapp.name} --user=${google_sql_user.taskapp.name} --quiet
       # Then run: npm run migrate && npm run seed
    
    3. Deploy backend to Cloud Run (will happen automatically after image push)
       Backend URL: ${google_cloud_run_service.backend.status[0].url}
    
    ${var.deploy_frontend_to_cloud_run ? 
      "4. Build and push frontend image:\n       cd frontend\n       docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.taskapp.repository_id}/taskapp-frontend:latest .\n       docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.taskapp.repository_id}/taskapp-frontend:latest\n\n    Frontend URL: ${google_cloud_run_service.frontend[0].status[0].url}" :
      "4. Deploy frontend to Vercel:\n       cd frontend\n       vercel --prod\n       # Set NEXT_PUBLIC_API_URL=${google_cloud_run_service.backend.status[0].url}/api"
    }
    
    🔐 Secrets stored in Secret Manager:
    - Database URL: ${google_secret_manager_secret.db_url.secret_id}
    - JWT Secret: ${google_secret_manager_secret.jwt_secret.secret_id}
    
    📊 Test the application:
    - API Health: ${google_cloud_run_service.backend.status[0].url}/health
    - Demo login: admin@example.com / password123
    
  EOF
}
