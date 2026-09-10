from fastapi import APIRouter, Depends, HTTPException

from app.database import get_connection
from app.auth import require_authentication

from app.services.preprocessing import split_into_sentences
from app.services.classifier import classify_sentence
from app.services.job_recommender import recommend_jobs
from app.services.ats_analyzer import analyze_ats_resume

import ast
import json


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


# =========================================================
# HELPER
# =========================================================

def parse_list(value):

    if value is None:
        return []

    # Already a Python list
    if isinstance(value, list):
        return value

    # Tuple
    if isinstance(value, tuple):
        return list(value)

    # JSON / text
    if isinstance(value, str):

        value = value.strip()

        if not value:
            return []

        # -------------------------------------------------
        # Try JSON
        # -------------------------------------------------

        try:

            parsed = json.loads(value)

            if isinstance(parsed, list):
                return parsed

            if isinstance(parsed, dict):
                return [parsed]

        except Exception:
            pass

        # -------------------------------------------------
        # Try Python format
        # -------------------------------------------------

        try:

            parsed = ast.literal_eval(value)

            if isinstance(parsed, list):
                return parsed

            if isinstance(parsed, dict):
                return [parsed]

        except Exception:
            pass

        # -------------------------------------------------
        # Comma-separated string
        # -------------------------------------------------

        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    return []


# =========================================================
# GET ALL CANDIDATES
#
# IMPORTANT:
# This route MUST come before /{candidate_id}
#
# URL:
# GET /candidates/
# =========================================================

@router.get("/")
def get_all_candidates(
    authenticated: bool = Depends(
        require_authentication
    )
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        # =================================================
        # GET CANDIDATES
        # =================================================

        cursor.execute(
            """
            SELECT

                c.id AS candidate_id,

                c.candidate_code,

                r.id AS resume_id,

                r.filename,

                e.id AS evaluation_id,

                e.job_id,

                j.title AS job_title,

                e.score,

                e.match_percentage,

                e.decision,

                e.created_at

            FROM candidates c

            LEFT JOIN resumes r
                ON r.candidate_id = c.id

            LEFT JOIN evaluations e
                ON e.resume_id = r.id

            LEFT JOIN jobs j
                ON j.id = e.job_id

            ORDER BY
                c.id DESC,
                e.id DESC
            """
        )

        rows = cursor.fetchall()

        candidates = []

        for row in rows:

            # ---------------------------------------------
            # SCORE
            # ---------------------------------------------

            score = (
                float(row[7])
                if row[7] is not None
                else 0
            )

            # ---------------------------------------------
            # MATCH
            # ---------------------------------------------

            match_percentage = (
                float(row[8])
                if row[8] is not None
                else 0
            )

            # ---------------------------------------------
            # DECISION
            # ---------------------------------------------

            decision = (
                row[9]
                if row[9]
                else "REVIEW"
            )

            # ---------------------------------------------
            # CANDIDATE OBJECT
            # ---------------------------------------------

            candidates.append({

                "candidate_id":
                    row[0],

                "candidate_code":
                    row[1],

                "resume_id":
                    row[2],

                "filename":
                    row[3]
                    if row[3]
                    else "N/A",

                "evaluation_id":
                    row[4],

                "job_id":
                    row[5],

                "job_title":
                    row[6]
                    if row[6]
                    else "N/A",

                "score":
                    score,

                "match_percentage":
                    match_percentage,

                "decision":
                    decision,

                "created_at":
                    row[10]

            })

        # =================================================
        # DEBUG
        # =================================================

        print(
            "Candidates returned:",
            len(candidates)
        )

        return candidates

    except Exception as error:

        print(
            "Get all candidates error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to load candidates."
        )

    finally:

        cursor.close()
        connection.close()


# =========================================================
# GET CANDIDATE BY ID
#
# URL:
# GET /candidates/102
# =========================================================

@router.get("/{candidate_id}")
def get_candidate(
    candidate_id: int,
    authenticated: bool = Depends(
        require_authentication
    )
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        # =================================================
        # DATABASE QUERY
        # =================================================

        cursor.execute(
            """
            SELECT

                c.id AS candidate_id,

                r.id AS resume_id,
                r.filename,
                r.redacted_text,

                e.id AS evaluation_id,
                e.job_id,

                j.title AS job_title,
                j.description AS job_description,
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

            ORDER BY
                e.id DESC,
                s.id DESC

            LIMIT 1
            """,
            (candidate_id,)
        )

        row = cursor.fetchone()

        # =================================================
        # CANDIDATE NOT FOUND
        # =================================================

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Candidate not found"
            )

        # =================================================
        # DEBUG
        # =================================================

        print("\n==============================")
        print("CANDIDATE DETAILS")
        print("==============================")

        print(
            "Candidate ID:",
            row[0]
        )

        print(
            "Resume ID:",
            row[1]
        )

        print(
            "Filename:",
            row[2]
        )

        print(
            "Evaluation ID:",
            row[4]
        )

        print(
            "Job ID:",
            row[5]
        )

        print(
            "Job Title:",
            row[6]
        )

        print(
            "Score:",
            row[9]
        )

        print(
            "Match:",
            row[10]
        )

        print(
            "Decision:",
            row[12]
        )

        print(
            "ML Prediction:",
            row[14]
        )

        print(
            "ML Confidence:",
            row[15]
        )

        print(
            "Skill Gap ID:",
            row[16]
        )

        print(
            "Matched Skills:",
            row[17]
        )

        print(
            "Missing Skills:",
            row[18]
        )

        print(
            "Recommendations:",
            row[19]
        )

        print("==============================\n")


        # =================================================
        # RESUME TEXT
        # =================================================

        resume_text = row[3] or ""


        # =================================================
        # REQUIRED SKILLS
        # =================================================

        required_skills = parse_list(
            row[8]
        )


        # =================================================
        # ATS ANALYSIS
        # =================================================

        ats_analysis = {}

        if resume_text:
            try:
                ats_analysis = analyze_ats_resume(
                    resume_text,
                    required_skills
                )

                print(
                    "ATS Score:",
                    ats_analysis.get("ats_score", 0)
                )

            except Exception as error:
                print(
                    "ATS analysis error:",
                    error
                )

                ats_analysis = {}


        # =================================================
        # MATCHED SKILLS
        # =================================================

        matched_skills = parse_list(
            row[17]
        )


        # =================================================
        # MISSING SKILLS
        # =================================================

        missing_skills = parse_list(
            row[18]
        )


        # =================================================
        # RECOMMENDATIONS
        # =================================================

        recommendations = parse_list(
            row[19]
        )


        # =================================================
        # SENTENCE ANALYSIS
        # =================================================

        classified_sentences = []

        if resume_text:

            try:

                sentences = split_into_sentences(
                    resume_text
                )

                print(
                    "Sentence count:",
                    len(sentences)
                )

                for sentence in sentences:

                    try:

                        category = classify_sentence(
                            sentence
                        )

                    except Exception as error:

                        print(
                            "Classifier error:",
                            error
                        )

                        category = "other"

                    classified_sentences.append({

                        "sentence":
                            sentence,

                        "category":
                            category

                    })

            except Exception as error:

                print(
                    "Sentence analysis error:",
                    error
                )


        # =================================================
        # RECOMMENDED JOBS
        # =================================================

        recommended_jobs = []

        if resume_text:

            try:

                result = recommend_jobs(
                    resume_text,
                    top_n=5
                )

                if isinstance(
                    result,
                    list
                ):

                    recommended_jobs = result

            except Exception as error:

                print(
                    "Recommended jobs error:",
                    error
                )


        # =================================================
        # DECISION
        # =================================================

        decision = (

            row[12]
            if row[12]
            else "REVIEW"

        )


        # =================================================
        # ML PREDICTION
        # =================================================

        ml_prediction = (

            row[14]
            if row[14]
            else "REVIEW"

        )


        # =================================================
        # ML CONFIDENCE
        # =================================================

        ml_confidence = (

            float(row[15])
            if row[15] is not None
            else 0

        )


        # =================================================
        # SYSTEM AGREEMENT
        # =================================================

        systems_agree = (

            str(decision).upper()
            ==
            str(ml_prediction).upper()

        )


        # =================================================
        # SCORE
        # =================================================

        score = (

            float(row[9])
            if row[9] is not None
            else 0

        )


        # =================================================
        # MATCH PERCENTAGE
        # =================================================

        match_percentage = (

            float(row[10])
            if row[10] is not None
            else 0

        )


        # =================================================
        # SUMMARY
        # =================================================

        summary = (

            row[11]
            if row[11]
            else "No summary available."

        )


        # =================================================
        # FINAL RESPONSE
        # =================================================

        response = {

            # -------------------------------------------------
            # BASIC
            # -------------------------------------------------

            "candidate_id":
                row[0],

            "resume_id":
                row[1],

            "filename":
                row[2]
                if row[2]
                else "N/A",

            "evaluation_id":
                row[4],


            # -------------------------------------------------
            # JOB
            # -------------------------------------------------

            "job_id":
                row[5],

            "job_title":
                row[6]
                if row[6]
                else "N/A",

            "job_description":
                row[7]
                if row[7]
                else "",

            "required_skills":
                required_skills,


            # -------------------------------------------------
            # ATS ANALYSIS
            # -------------------------------------------------

            "ats_analysis":
                ats_analysis,


            # -------------------------------------------------
            # SCREENING
            # -------------------------------------------------

            "score":
                score,

            "match_percentage":
                match_percentage,

            "summary":
                summary,

            "decision":
                decision,

            "created_at":
                row[13],


            # -------------------------------------------------
            # ML
            # -------------------------------------------------

            "ml_prediction":
                ml_prediction,

            "ml_confidence":
                ml_confidence,


            # -------------------------------------------------
            # SYSTEM
            # -------------------------------------------------

            "systems_agree":
                systems_agree,


            # -------------------------------------------------
            # SKILL GAP
            # -------------------------------------------------

            "skill_gap_id":
                row[16],

            "skill_gap": {

                "matched_skills":
                    matched_skills,

                "missing_skills":
                    missing_skills,

                "recommendations":
                    recommendations

            },


            # -------------------------------------------------
            # SENTENCE ANALYSIS
            # -------------------------------------------------

            "sentences":
                classified_sentences,


            # -------------------------------------------------
            # RECOMMENDED JOBS
            # -------------------------------------------------

            "recommended_jobs":
                recommended_jobs

        }


        # =================================================
        # DEBUG RESPONSE
        # =================================================

        print(
            "Returning:",
            {

                "candidate_id":
                    response[
                        "candidate_id"
                    ],

                "decision":
                    response[
                        "decision"
                    ],

                "matched_skills":
                    response[
                        "skill_gap"
                    ][
                        "matched_skills"
                    ],

                "missing_skills":
                    response[
                        "skill_gap"
                    ][
                        "missing_skills"
                    ],

                "recommendations":
                    len(
                        response[
                            "skill_gap"
                        ][
                            "recommendations"
                        ]
                    ),

                "sentences":
                    len(
                        response[
                            "sentences"
                        ]
                    ),

                "recommended_jobs":
                    len(
                        response[
                            "recommended_jobs"
                        ]
                    )

            }
        )


        return response


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Candidate API error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:

        cursor.close()
        connection.close()