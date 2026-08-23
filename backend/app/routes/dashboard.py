from fastapi import APIRouter
from app.database import get_connection


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================================================
# GET DASHBOARD STATISTICS
# =========================================================

@router.get("/stats")
def get_dashboard_stats():

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_candidates,

                COUNT(*) FILTER (
                    WHERE decision = 'SHORTLIST'
                ) AS shortlisted,

                COUNT(*) FILTER (
                    WHERE decision = 'REJECT'
                ) AS rejected,

                COUNT(*) FILTER (
                    WHERE decision = 'REVIEW'
                ) AS review,

                COALESCE(
                    ROUND(AVG(match_percentage), 2),
                    0
                ) AS average_match_percentage

            FROM evaluations;
            """
        )

        row = cursor.fetchone()

        return {
            "total_candidates": row[0],
            "shortlisted": row[1],
            "rejected": row[2],
            "review": row[3],
            "average_match_percentage": float(row[4])
        }

    finally:

        cursor.close()
        connection.close()