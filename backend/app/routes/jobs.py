from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import get_connection
from app.auth import require_authentication


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: str


# =========================================================
# GET ALL JOBS
# =========================================================

@router.get("")
def get_jobs(
    authenticated: bool = Depends(
        require_authentication
    )
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                id,
                title,
                description,
                required_skills
            FROM jobs
            ORDER BY id DESC;
            """
        )

        rows = cursor.fetchall()

        jobs = []

        for row in rows:

            jobs.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "required_skills": row[3]
            })

        return jobs

    finally:

        cursor.close()
        connection.close()


# =========================================================
# CREATE JOB
# =========================================================

@router.post("/create")
def create_job(
    job: JobCreate,
    authenticated: bool = Depends(
        require_authentication
    )
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO jobs (
                title,
                description,
                required_skills
            )
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (
                job.title,
                job.description,
                job.required_skills
            )
        )

        job_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "message": "Job created successfully",
            "job_id": job_id
        }

    finally:

        cursor.close()
        connection.close()