#!/bin/bash

# Deploy script for backend to Google Cloud Run
set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
ENVIRONMENT=${3:-"dev"}

echo "🚀 Deploying TaskApp Backend to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"

# Authenticate with Google Cloud (if not already authenticated)
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "📝 Please authenticate with Google Cloud..."
    gcloud auth login
    gcloud auth application-default login
fi

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push Docker image
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/taskapp/taskapp-backend:latest"

echo "🏗️ Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing Docker image to Artifact Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy taskapp-backend-${ENVIRONMENT} \
    --image=$IMAGE_NAME \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=8000 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=10 \
    --concurrency=80 \
    --timeout=300 \
    --set-env-vars="NODE_ENV=${ENVIRONMENT}" \
    --set-env-vars="PORT=8000" \
    --set-secrets="DATABASE_URL=taskapp-db-url-${ENVIRONMENT}:latest" \
    --set-secrets="JWT_SECRET=taskapp-jwt-secret-${ENVIRONMENT}:latest"

# Get service URL
SERVICE_URL=$(gcloud run services describe taskapp-backend-${ENVIRONMENT} --region=$REGION --format='value(status.url)')

echo "✅ Backend deployment completed!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/health"
echo ""
echo "Next steps:"
echo "1. Run database migrations if this is the first deployment"
echo "2. Test the API endpoints"
echo "3. Update frontend environment variables with the new API URL"
