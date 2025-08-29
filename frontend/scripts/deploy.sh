#!/bin/bash

# Deploy script for frontend to Google Cloud Run
set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
ENVIRONMENT=${3:-"dev"}
API_URL=${4:-"https://taskapp-backend-${ENVIRONMENT}-uc.a.run.app/api"}

echo "🚀 Deploying TaskApp Frontend to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo "API URL: $API_URL"

# Authenticate with Google Cloud (if not already authenticated)
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "📝 Please authenticate with Google Cloud..."
    gcloud auth login
    gcloud auth application-default login
fi

# Set project
gcloud config set project $PROJECT_ID

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push Docker image with build arg
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/taskapp/taskapp-frontend:latest"

echo "🏗️ Building Docker image with API URL..."
docker build \
    --build-arg NEXT_PUBLIC_API_URL=$API_URL \
    -t $IMAGE_NAME .

echo "📤 Pushing Docker image to Artifact Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy taskapp-frontend-${ENVIRONMENT} \
    --image=$IMAGE_NAME \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --concurrency=100 \
    --timeout=60 \
    --set-env-vars="NODE_ENV=${ENVIRONMENT}" \
    --set-env-vars="NEXT_PUBLIC_API_URL=${API_URL}"

# Get service URL
SERVICE_URL=$(gcloud run services describe taskapp-frontend-${ENVIRONMENT} --region=$REGION --format='value(status.url)')

echo "✅ Frontend deployment completed!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "🎉 Your TaskApp is now live!"
echo "📱 Frontend: $SERVICE_URL"
echo "🔗 API: $API_URL"
