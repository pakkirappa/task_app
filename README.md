# Task App - Campaign & Lead Management

A production-ready task management application with CRUD operations for Campaigns & Leads, complete with authentication and GCP deployment.

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Next.js
- **Database**: PostgreSQL (Google Cloud SQL)
- **Authentication**: JWT with email/password
- **Infrastructure**: Google Cloud Platform with Terraform
- **Deployment**: Cloud Run, Cloud SQL, Secret Manager, Artifact Registry

## Features

### Backend

- JWT-based authentication (register/login)
- CRUD operations for Campaigns and Leads
- Protected API endpoints
- Database migrations and seeding
- Unit tests
- Health check endpoints

### Frontend

- User authentication (login/register)
- Campaigns management (list, create, edit, delete)
- Leads management (list, create, edit, delete)
- Dashboard with KPIs and charts
- CSV export functionality
- Responsive design

### Infrastructure

- **Terraform IaC** for complete GCP provisioning
- **Cloud Run** for containerized application deployment
- **Cloud SQL** for PostgreSQL database
- **Secret Manager** for secure credential storage
- **Artifact Registry** for container images
- **IAM** with least-privilege access

## Project Structure

```
/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Next.js React app
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── Dockerfile
│   └── package.json
├── terraform/               # Infrastructure as Code
│   ├── modules/
│   ├── environments/
│   └── main.tf
├── .github/workflows/       # CI/CD pipelines
└── docker-compose.yml       # Local development
```

## Getting Started

### Local Development

1. **Clone and install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Set up local database**

   ```bash
   # Start PostgreSQL with Docker Compose
   docker-compose up -d postgres

   # Run database migrations
   cd backend
   npm run migrate
   npm run seed
   ```

3. **Start development servers**

   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev

   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Test user: `admin@example.com` / `password123`

### Deployment to GCP

1. **Set up GCP and Terraform**

   ```bash
   # Authenticate with GCP
   gcloud auth login
   gcloud auth application-default login

   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Deploy infrastructure**

   ```bash
   cd terraform
   terraform init
   terraform plan -var="project_id=YOUR_PROJECT_ID"
   terraform apply
   ```

3. **Deploy applications**

   ```bash
   # Build and deploy backend
   cd backend
   npm run deploy

   # Build and deploy frontend
   cd frontend
   npm run deploy
   ```

## Environment Variables

### Backend

- `NODE_ENV`: production|development
- `PORT`: Server port (default: 8000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `CORS_ORIGIN`: Frontend URL for CORS

### Frontend

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NODE_ENV`: production|development

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Campaigns

- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Leads

- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/export/csv` - Export leads to CSV

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
