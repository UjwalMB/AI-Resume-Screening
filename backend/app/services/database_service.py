from psycopg.types.json import Jsonb

from app.database import get_connection


# =========================================================
# SAVE CANDIDATE
# =========================================================

def save_candidate(candidate_code):

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO candidates (
                    candidate_code
                )
                VALUES (%s)
                RETURNING id
                """,
                (candidate_code,)
            )

            candidate_id = cursor.fetchone()[0]

        connection.commit()

        return candidate_id

    finally:

        connection.close()


# =========================================================
# SAVE RESUME
# =========================================================

def save_resume(
    candidate_id,
    filename,
    extracted_text,
    clean_text
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO resumes (
                candidate_id,
                filename,
                raw_text,
                redacted_text
            )
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (
                candidate_id,
                filename,
                extracted_text,
                clean_text
            )
        )

        resume_id = cursor.fetchone()[0]

        connection.commit()

        return resume_id

    finally:
        cursor.close()
        connection.close()

# =========================================================
# SAVE EVALUATION
# =========================================================

def save_evaluation(
    resume_id,
    job_id,
    score,
    match_percentage,
    summary,
    decision,
    ml_prediction,
    ml_confidence
):

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO evaluations (
                    resume_id,
                    job_id,
                    score,
                    match_percentage,
                    summary,
                    decision,
                    ml_prediction,
                    ml_confidence
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                RETURNING id
                """,
                (
                    resume_id,
                    job_id,
                    score,
                    match_percentage,
                    summary,
                    decision,
                    ml_prediction,
                    ml_confidence
                )
            )

            evaluation_id = cursor.fetchone()[0]

        connection.commit()

        return evaluation_id

    finally:

        connection.close()

# =========================================================
# SAVE SKILL GAP
# =========================================================

def save_skill_gap(
    candidate_id,
    matched_skills,
    missing_skills,
    recommendations
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO candidate_skill_gaps (
                candidate_id,
                matched_skills,
                missing_skills,
                recommendations
            )
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (
                candidate_id,
                ", ".join(matched_skills),
                ", ".join(missing_skills),
                str(recommendations)
            )
        )

        skill_gap_id = cursor.fetchone()[0]

        connection.commit()

        return skill_gap_id

    finally:
        cursor.close()
        connection.close()

# =========================================================
# GET ALL CANDIDATES
# =========================================================

def get_all_candidates():

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    c.id AS candidate_id,
                    c.candidate_code,
                    r.filename,
                    e.score,
                    e.match_percentage,
                    e.decision

                FROM candidates c

                LEFT JOIN resumes r
                    ON c.id = r.candidate_id

                LEFT JOIN evaluations e
                    ON r.id = e.resume_id

                ORDER BY c.id DESC
                """
            )

            rows = cursor.fetchall()

            candidates = []

            for row in rows:

                candidates.append({

                    "candidate_id":
                        row[0],

                    "candidate_code":
                        row[1],

                    "filename":
                        row[2],

                    "score":
                        row[3],

                    "match_percentage":
                        float(row[4])
                        if row[4] is not None
                        else 0,

                    "decision":
                        row[5]
                })

            return candidates

    finally:

        connection.close()


# =========================================================
# GET CANDIDATE BY ID
# =========================================================

def get_candidate_by_id(candidate_id):

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    c.id AS candidate_id,
                    c.candidate_code,

                    r.id AS resume_id,
                    r.filename,

                    e.id AS evaluation_id,
                    e.score,
                    e.match_percentage,
                    e.summary,
                    e.decision,

                    sgr.matched_skills,
                    sgr.missing_skills,
                    sgr.recommendations

                FROM candidates c

                LEFT JOIN resumes r
                    ON c.id = r.candidate_id

                LEFT JOIN evaluations e
                    ON r.id = e.resume_id

                LEFT JOIN skill_gap_results sgr
                    ON r.id = sgr.resume_id

                WHERE c.id = %s

                ORDER BY e.id DESC

                LIMIT 1
                """,
                (candidate_id,)
            )

            row = cursor.fetchone()

            if not row:

                return None


            return {

                "candidate_id":
                    row[0],

                "candidate_code":
                    row[1],

                "resume_id":
                    row[2],

                "filename":
                    row[3],

                "evaluation_id":
                    row[4],

                "score":
                    row[5],

                "match_percentage":
                    float(row[6])
                    if row[6] is not None
                    else 0,

                "summary":
                    row[7],

                "decision":
                    row[8],

                "skill_gap": {

                    "matched_skills":
                        row[9] or [],

                    "missing_skills":
                        row[10] or [],

                    "recommendations":
                        row[11] or []
                }
            }

    finally:

        connection.close()