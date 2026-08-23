from fastapi import APIRouter, Depends

from app.database import get_connection
from app.auth import require_authentication


router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


# =========================================================
# GET ALL CANDIDATES
# =========================================================

@router.get("")
def get_candidates(
    authenticated: bool = Depends(require_authentication)
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                c.id AS candidate_id,
                r.filename,
                e.job_id,
                e.score,
                e.match_percentage,
                e.decision,
                e.ml_prediction,
                e.ml_confidence

            FROM candidates c

            LEFT JOIN resumes r
                ON r.candidate_id = c.id

            LEFT JOIN evaluations e
                ON e.resume_id = r.id

            ORDER BY c.id DESC;
            """
        )

        rows = cursor.fetchall()

        candidates = []

        for row in rows:

            decision = (
                row[5]
                if row[5]
                else "REVIEW"
            )

            ml_prediction = (
                row[6]
                if row[6]
                else "REVIEW"
            )

            ml_confidence = (
                float(row[7])
                if row[7] is not None
                else 0
            )

            # =================================================
            # COMPARE EXISTING SYSTEM + ML SYSTEM
            # =================================================

            systems_agree = (
                decision.upper()
                ==
                ml_prediction.upper()
            )

            candidates.append({

                # ---------------------------------------------
                # BASIC INFORMATION
                # ---------------------------------------------

                "candidate_id":
                    row[0],

                "filename":
                    row[1]
                    if row[1]
                    else "N/A",

                "job_id":
                    row[2],


                # ---------------------------------------------
                # EXISTING SCREENING SYSTEM
                # ---------------------------------------------

                "score":
                    row[3]
                    if row[3] is not None
                    else 0,

                "match_percentage":
                    float(row[4])
                    if row[4] is not None
                    else 0,

                "decision":
                    decision,


                # ---------------------------------------------
                # MACHINE LEARNING SYSTEM
                # ---------------------------------------------

                "ml_prediction":
                    ml_prediction,

                "ml_confidence":
                    ml_confidence,


                # ---------------------------------------------
                # SYSTEM COMPARISON
                # ---------------------------------------------

                "systems_agree":
                    systems_agree
            })

        return candidates

    finally:

        cursor.close()
        connection.close()


# =========================================================
# GET SINGLE CANDIDATE
# =========================================================

@router.get("/{candidate_id}")
def get_candidate(
    candidate_id: int,
    authenticated: bool = Depends(require_authentication)
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT

                c.id AS candidate_id,

                r.id AS resume_id,
                r.filename,

                e.id AS evaluation_id,
                e.job_id,

                j.title AS job_title,
                j.required_skills,

                e.score,
                e.match_percentage,
                e.summary,
                e.decision,
                e.created_at,

                e.ml_prediction,
                e.ml_confidence,

                s.id AS skill_gap_id,
                s.matched_skills,
                s.missing_skills,
                s.recommendations

            FROM candidates c

            LEFT JOIN resumes r
                ON r.candidate_id = c.id

            LEFT JOIN evaluations e
                ON e.resume_id = r.id

            LEFT JOIN jobs j
                ON j.id = e.job_id

            LEFT JOIN candidate_skill_gaps s
                ON s.candidate_id = c.id

            WHERE c.id = %s

            ORDER BY s.id DESC

            LIMIT 1;
            """,
            (candidate_id,)
        )

        row = cursor.fetchone()


        # =================================================
        # CANDIDATE NOT FOUND
        # =================================================

        if not row:

            return {
                "message": "Candidate not found"
            }


        # =================================================
        # REQUIRED SKILLS
        # =================================================

        required_skills = []

        if row[6]:

            if isinstance(row[6], list):

                required_skills = row[6]

            else:

                required_skills = [
                    skill.strip()
                    for skill in str(row[6]).split(",")
                    if skill.strip()
                ]


        # =================================================
        # MATCHED SKILLS
        # =================================================

        matched_skills = []

        if row[15]:

            if isinstance(row[15], list):

                matched_skills = row[15]

            else:

                matched_skills = [
                    skill.strip()
                    for skill in str(row[15]).split(",")
                    if skill.strip()
                ]


        # =================================================
        # MISSING SKILLS
        # =================================================

        missing_skills = []

        if row[16]:

            if isinstance(row[16], list):

                missing_skills = row[16]

            else:

                missing_skills = [
                    skill.strip()
                    for skill in str(row[16]).split(",")
                    if skill.strip()
                ]


        # =================================================
        # RECOMMENDATIONS
        # =================================================

        recommendations = []

        if row[17]:

            if isinstance(row[17], list):

                recommendations = row[17]

            else:

                recommendations = row[17]


        # =================================================
        # EXISTING DECISION
        # =================================================

        decision = (

            row[10]
            if row[10]
            else "REVIEW"

        )


        # =================================================
        # ML RESULT
        # =================================================

        ml_prediction = (

            row[12]
            if row[12]
            else "REVIEW"

        )

        ml_confidence = (

            float(row[13])
            if row[13] is not None
            else 0

        )


        # =================================================
        # SYSTEM COMPARISON
        # =================================================

        systems_agree = (

            decision.upper()
            ==
            ml_prediction.upper()

        )


        # =================================================
        # RETURN CANDIDATE
        # =================================================

        return {

            # ---------------------------------------------
            # BASIC INFORMATION
            # ---------------------------------------------

            "candidate_id":
                row[0],

            "resume_id":
                row[1],

            "filename":
                row[2]
                if row[2]
                else "N/A",

            "evaluation_id":
                row[3],


            # ---------------------------------------------
            # JOB INFORMATION
            # ---------------------------------------------

            "job_id":
                row[4],

            "job_title":
                row[5]
                if row[5]
                else "N/A",

            "required_skills":
                required_skills,


            # ---------------------------------------------
            # EXISTING SCREENING RESULTS
            # ---------------------------------------------

            "score":
                row[7]
                if row[7] is not None
                else 0,

            "match_percentage":
                float(row[8])
                if row[8] is not None
                else 0,

            "summary":
                row[9]
                if row[9]
                else "No summary available.",

            "decision":
                decision,

            "created_at":
                row[11],


            # ---------------------------------------------
            # MACHINE LEARNING RESULTS
            # ---------------------------------------------

            "ml_prediction":
                ml_prediction,

            "ml_confidence":
                ml_confidence,


            # ---------------------------------------------
            # SYSTEM COMPARISON
            # ---------------------------------------------

            "systems_agree":
                systems_agree,


            # ---------------------------------------------
            # SKILL GAP
            # ---------------------------------------------

            "skill_gap_id":
                row[14],

            "skill_gap": {

                "matched_skills":
                    matched_skills,

                "missing_skills":
                    missing_skills,

                "recommendations":
                    recommendations

            }

        }

    finally:

        cursor.close()
        connection.close()