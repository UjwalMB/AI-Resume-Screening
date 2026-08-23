# AI Resume Screening

An intelligent resume screening platform that uses **machine learning** and **rule-based analysis** to evaluate, score, and classify resumes for smarter hiring decisions.


## Features

- **Resume Upload & Parsing** — Upload PDF resumes, extract text automatically
- **AI-Powered Screening** — ML model predicts SHORTLIST / REJECT / REVIEW
- **Rule-Based Scoring** — Sentence classification and scoring system
- **Dual-System Comparison** — Compare ML and rule-based decisions
- **Skill Gap Analysis** — Identify matched and missing skills per job
- **Job Management** — Create and manage job postings with required skills
- **Dashboard** — Visual analytics with charts and statistics
- **Authentication** — Protected routes with token-based auth


## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite 8, React Router, Recharts, Axios |
| Backend    | FastAPI, Gunicorn, Uvicorn                       |
| Database   | PostgreSQL 16                                    |
| ML         | scikit-learn, spaCy, TF-IDF Vectorizer           |
| Deployment | Docker, Docker Compose, Nginx                    |


## Project Structure

```
AI-Resume-Screening/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── auth.py              # Authentication configuration
│   │   ├── database.py          # Database connection
│   │   ├── models/              # Pydantic schemas
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.py          # Login endpoint
│   │   │   ├── resume.py        # Resume upload & screening
│   │   │   ├── jobs.py          # Job management
│   │   │   ├── candidates.py    # Candidate data
│   │   │   ├── dashboard.py     # Dashboard statistics
│   │   │   └── ml.py            # ML model metrics
│   │   └── services/            # Business logic
│   │       ├── classifier.py    # Sentence classification
│   │       ├── database_service.py
│   │       ├── decision.py      # Decision engine
│   │       ├── grader.py        # Resume scoring
│   │       ├── parser.py        # PDF text extraction
│   │       ├── preprocessing.py # Text preprocessing
│   │       └── skill_gap.py     # Skill gap analysis
│   ├── ml/
│   │   ├── resume_model.pkl     # Trained ML model
│   │   ├── tfidf_vectorizer.pkl # TF-IDF vectorizer
│   │   ├── ml_service.py        # ML prediction service
│   │   └── train_model.py       # Model training script
│   ├── Dockerfile
│   ├── init.sql                 # Database schema
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app with routing
│   │   ├── api.js               # Axios API client
│   │   ├── components/          # Shared components
│   │   └── pages/               # Page components
│   ├── Dockerfile
│   ├── nginx.conf               # SPA serving config
│   └── package.json
├── nginx/
│   └── nginx.conf               # Reverse proxy config
├── docker-compose.yml           # Dev orchestration
├── docker-compose.prod.yml      # Production overrides
└── .env.example                 # Environment variables template
```


## Quick Start


### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

Or for local development without Docker:

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+


### Option 1: Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AI-Resume-Screening
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your production credentials:

   ```env
   POSTGRES_PASSWORD=your_secure_password
   ADMIN_PASSWORD=your_admin_password
   AUTH_TOKEN=your_secure_token
   ```

4. **Build and start all services**

   ```bash
   docker compose up -d --build
   ```

5. **Access the application**

   | Service   | URL                      |
   |-----------|--------------------------|
   | Frontend  | http://localhost:3000     |
   | Backend   | http://localhost:8000     |
   | API Docs  | http://localhost:8000/docs|

6. **Default login credentials**

   ```
   Username: admin
   Password: admin
   ```


### Option 2: Local Development

1. **Start PostgreSQL** and create the database:

   ```bash
   createdb resume_screening
   psql -d resume_screening -f backend/init.sql
   ```

2. **Backend setup**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate    # macOS/Linux
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   uvicorn app.main:app --reload
   ```

3. **Frontend setup** (in a new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**

   | Service   | URL                      |
   |-----------|--------------------------|
   | Frontend  | http://localhost:5173     |
   | Backend   | http://localhost:8000     |


### Production Deployment

For production deployment with resource limits and restart policies:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```


## Environment Variables

| Variable          | Default               | Description                          |
|-------------------|-----------------------|--------------------------------------|
| `POSTGRES_DB`     | `resume_screening`    | PostgreSQL database name             |
| `POSTGRES_USER`   | `ujwal`               | PostgreSQL username                  |
| `POSTGRES_PASSWORD`| `password`           | PostgreSQL password                  |
| `ADMIN_USERNAME`  | `admin`               | Login username                       |
| `ADMIN_PASSWORD`  | `admin`               | Login password                       |
| `AUTH_TOKEN`      | `admin-token`         | API authentication token             |
| `CORS_ORIGINS`    | `http://localhost:5173`| Allowed CORS origins (comma-separated)|
| `VITE_API_URL`    | `http://localhost:8000`| Backend API URL for the frontend     |


## API Endpoints

| Method | Endpoint               | Auth | Description             |
|--------|------------------------|------|-------------------------|
| POST   | `/auth/login`          | No   | Login                   |
| POST   | `/resume/upload`       | No   | Upload & screen resume  |
| GET    | `/jobs`                | Yes  | List all jobs           |
| POST   | `/jobs/create`         | Yes  | Create a new job        |
| GET    | `/candidates`          | Yes  | List all candidates     |
| GET    | `/candidates/{id}`     | Yes  | Get candidate details   |
| GET    | `/dashboard/stats`     | No   | Dashboard statistics    |
| GET    | `/ml/metrics`          | No   | ML model metrics        |


## Running Tests

```bash
cd backend
python -m pytest -v
```


## License

This project is for educational and demonstration purposes.
