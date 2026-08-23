from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.resume import router as resume_router
from app.routes.jobs import router as jobs_router
from app.routes.candidates import router as candidates_router
from app.routes import auth
from app.routes import dashboard


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Resume Screening API",
    version="0.1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "AI Resume Screening API is running"
    }


# =========================================================
# ROUTES
# =========================================================

app.include_router(
    resume_router
)

app.include_router(
    jobs_router
)

app.include_router(
    candidates_router
)

app.include_router(
    auth.router
)

app.include_router(
    dashboard.router
)