from fastapi import APIRouter, UploadFile, File, HTTPException

import os
import uuid
import json


# =========================================================
# SERVICES
# =========================================================

from app.services.parser import extract_text_from_pdf

from app.services.preprocessing import (
    preprocess_text,
    split_into_sentences
)

from app.services.classifier import classify_sentence

from app.services.grader import (
    calculate_score,
    generate_summary
)

from app.services.decision import (
    calculate_job_match,
    make_decision
)

from app.services.database_service import (
    save_candidate,
    save_resume,
    save_evaluation,
    save_skill_gap
)

from app.services.skill_gap import find_skill_gaps

from app.services.job_recommender import recommend_jobs

from app.services.sbert_service import calculate_similarity

from ml.ml_service import predict_resume

from app.database import get_connection


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


# =========================================================
# UPLOAD FOLDER
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# GET JOB
# =========================================================

def get_job_by_id(job_id):

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    description,
                    required_skills
                FROM jobs
                WHERE id = %s
                """,
                (job_id,)
            )

            row = cursor.fetchone()

            if not row:
                return None

            return {
                "id": row[0],
                "title": row[1],
                "description": row[2] or "",
                "required_skills": row[3] or []
            }

    finally:

        connection.close()


# =========================================================
# CALCULATE SBERT JOB SCORE
# =========================================================

def calculate_job_sbert_score(
    resume_text,
    job
):

    try:

        job_text = " ".join([
            str(job.get("title", "")),
            str(job.get("description", "")),
            " ".join(
                job.get("required_skills", [])
            )
        ])

        similarity = calculate_similarity(
            resume_text,
            job_text
        )

        similarity = float(similarity)

        # -------------------------------------------------
        # Handle models returning 0-1
        # -------------------------------------------------

        if similarity <= 1:

            similarity = similarity * 100

        similarity = max(
            0,
            min(
                similarity,
                100
            )
        )

        return round(
            similarity,
            2
        )

    except Exception as error:

        print(
            "SBERT error:",
            error
        )

        return 0.0


# =========================================================
# FINAL JOB SCORE
# =========================================================

def calculate_final_job_score(
    skill_match,
    sbert_similarity,
    resume_quality,
    ml_confidence
):

    # =====================================================
    # WEIGHTS
    #
    # Skill Match       = 40%
    # SBERT Similarity  = 30%
    # Resume Quality    = 20%
    # ML Confidence     = 10%
    # =====================================================

    final_score = (

        (float(skill_match) * 0.40)

        +

        (float(sbert_similarity) * 0.30)

        +

        (float(resume_quality) * 0.20)

        +

        (float(ml_confidence) * 0.10)

    )

    return round(
        max(
            0,
            min(
                final_score,
                100
            )
        ),
        2
    )


# =========================================================
# UPLOAD + SCREEN RESUME
# =========================================================

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_id: int = 1
):

    print("\n")
    print("=" * 60)
    print("STARTING RESUME SCREENING")
    print("=" * 60)

    # =====================================================
    # STEP 1: VALIDATE FILE
    # =====================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please upload a resume."
        )

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported."
        )


    print(
        "Uploaded file:",
        file.filename
    )


    # =====================================================
    # STEP 2: GET JOB
    # =====================================================

    job = get_job_by_id(
        job_id
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail=f"Job with ID {job_id} not found."
        )


    print("\n==============================")
    print("SELECTED JOB")
    print("==============================")

    print(
        "Job ID:",
        job["id"]
    )

    print(
        "Job Title:",
        job["title"]
    )

    print(
        "Required Skills:",
        job["required_skills"]
    )


    # =====================================================
    # STEP 3: SAVE PDF
    # =====================================================

    unique_filename = (
        f"{uuid.uuid4().hex[:8]}_"
        f"{file.filename}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    try:

        content = await file.read()

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(content)

    except Exception as error:

        print(
            "File save error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save uploaded resume."
        )


    print(
        "Resume saved:",
        file_path
    )


    # =====================================================
    # STEP 4: EXTRACT PDF TEXT
    # =====================================================

    try:

        extracted_text = extract_text_from_pdf(
            file_path
        )

    except Exception as error:

        print(
            "PDF extraction error:",
            error
        )

        raise HTTPException(
            status_code=400,
            detail="Unable to read the PDF."
        )


    if not extracted_text:

        raise HTTPException(
            status_code=400,
            detail="No text could be extracted from the PDF."
        )


    print(
        "Extracted characters:",
        len(extracted_text)
    )


    # =====================================================
    # STEP 5: PREPROCESS
    # =====================================================

    try:

        clean_text = preprocess_text(
            extracted_text
        )

    except Exception as error:

        print(
            "Preprocessing error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to preprocess resume."
        )


    print(
        "Clean text characters:",
        len(clean_text)
    )


    # =====================================================
    # STEP 6: ML PREDICTION
    # =====================================================

    try:

        ml_result = predict_resume(
            clean_text
        )

        ml_prediction = str(
            ml_result.get(
                "prediction",
                "REVIEW"
            )
        )

        ml_confidence = float(
            ml_result.get(
                "confidence",
                0
            )
        )

    except Exception as error:

        print(
            "ML prediction error:",
            error
        )

        ml_prediction = "REVIEW"

        ml_confidence = 0.0


    print("\n==============================")
    print("ML MODEL")
    print("==============================")

    print(
        "Prediction:",
        ml_prediction
    )

    print(
        "Confidence:",
        ml_confidence
    )


    # =====================================================
    # STEP 7: SPLIT SENTENCES
    # =====================================================

    try:

        sentences = split_into_sentences(
            clean_text
        )

    except Exception as error:

        print(
            "Sentence splitting error:",
            error
        )

        sentences = [
            clean_text
        ]


    # =====================================================
    # STEP 8: CLASSIFY SENTENCES
    # =====================================================

    classified_sentences = []

    for sentence in sentences:

        try:

            category = classify_sentence(
                sentence
            )

        except Exception as error:

            print(
                "Classification error:",
                error
            )

            category = "other"

        classified_sentences.append({

            "sentence":
                sentence,

            "category":
                category

        })


    # =====================================================
    # STEP 9: RESUME QUALITY SCORE
    # =====================================================

    try:

        resume_quality_score = calculate_score(
            classified_sentences
        )

    except Exception as error:

        print(
            "Resume score error:",
            error
        )

        resume_quality_score = 0


    print("\n==============================")
    print("RESUME QUALITY")
    print("==============================")

    print(
        "Resume Quality:",
        resume_quality_score
    )


    # =====================================================
    # STEP 10: SUMMARY
    # =====================================================

    try:

        summary = generate_summary(
            classified_sentences
        )

    except Exception as error:

        print(
            "Summary error:",
            error
        )

        summary = ""


    # =====================================================
    # STEP 11: JOB SKILL MATCH
    # =====================================================

    required_skills = job.get(
        "required_skills",
        []
    )

    # -----------------------------------------------------
    # PostgreSQL may return string instead of list
    # -----------------------------------------------------

    if isinstance(
        required_skills,
        str
    ):

        try:

            parsed_skills = json.loads(
                required_skills
            )

            if isinstance(
                parsed_skills,
                list
            ):

                required_skills = parsed_skills

            else:

                required_skills = [
                    skill.strip()
                    for skill in required_skills.split(",")
                    if skill.strip()
                ]

        except Exception:

            required_skills = [
                skill.strip()
                for skill in required_skills.split(",")
                if skill.strip()
            ]


    print("\n==============================")
    print("JOB SKILL MATCH")
    print("==============================")


    try:

        job_match = calculate_job_match(
            clean_text,
            required_skills
        )

    except Exception as error:

        print(
            "Job match error:",
            error
        )

        job_match = {

            "matched_skills":
                [],

            "missing_skills":
                required_skills,

            "match_percentage":
                0

        }


    print(
        "Matched:",
        job_match["matched_skills"]
    )

    print(
        "Missing:",
        job_match["missing_skills"]
    )

    print(
        "Match:",
        job_match["match_percentage"]
    )


    # =====================================================
    # STEP 12: SBERT
    # =====================================================

    sbert_similarity = calculate_job_sbert_score(
        clean_text,
        job
    )


    print("\n==============================")
    print("SBERT")
    print("==============================")

    print(
        "SBERT Similarity:",
        sbert_similarity
    )


    # =====================================================
    # STEP 13: FINAL SCORE
    # =====================================================

    score = calculate_final_job_score(

        job_match[
            "match_percentage"
        ],

        sbert_similarity,

        resume_quality_score,

        ml_confidence

    )


    print("\n==============================")
    print("FINAL SCORE")
    print("==============================")

    print(
        "Skill Match:",
        job_match["match_percentage"]
    )

    print(
        "SBERT:",
        sbert_similarity
    )

    print(
        "Resume Quality:",
        resume_quality_score
    )

    print(
        "ML Confidence:",
        ml_confidence
    )

    print(
        "FINAL SCORE:",
        score
    )


    # =====================================================
    # STEP 14: SKILL GAP
    # =====================================================

    try:

        skill_gap_result = find_skill_gaps(
            clean_text,
            required_skills
        )

        if isinstance(
            skill_gap_result,
            dict
        ):

            matched_skills = (
                skill_gap_result.get(
                    "matched_skills",
                    job_match["matched_skills"]
                )
            )

            missing_skills = (
                skill_gap_result.get(
                    "missing_skills",
                    job_match["missing_skills"]
                )
            )

            recommendations = (
                skill_gap_result.get(
                    "recommendations",
                    []
                )
            )

        else:

            matched_skills = job_match[
                "matched_skills"
            ]

            missing_skills = job_match[
                "missing_skills"
            ]

            recommendations = []

    except Exception as error:

        print(
            "Skill gap error:",
            error
        )

        matched_skills = job_match[
            "matched_skills"
        ]

        missing_skills = job_match[
            "missing_skills"
        ]

        recommendations = []


    # =====================================================
    # STEP 15: DECISION
    # =====================================================

    try:

        decision = make_decision(
            score,
            job_match[
                "match_percentage"
            ]
        )

    except Exception as error:

        print(
            "Decision error:",
            error
        )

        decision = "REVIEW"


    # =====================================================
    # STEP 16: SYSTEM AGREEMENT
    # =====================================================

    systems_agree = (

        decision.upper()
        ==
        ml_prediction.upper()

    )


    print("\n==============================")
    print("DECISION")
    print("==============================")

    print(
        "AI Decision:",
        decision
    )

    print(
        "ML Prediction:",
        ml_prediction
    )

    print(
        "Systems Agree:",
        systems_agree
    )


    # =====================================================
    # STEP 17: JOB RECOMMENDATIONS
    # =====================================================

    try:

        recommended_jobs = recommend_jobs(
            clean_text
        )

    except Exception as error:

        print(
            "Job recommendation error:",
            error
        )

        recommended_jobs = []


    # =====================================================
    # STEP 18: SAVE TO DATABASE
    # =====================================================

    print("\n==============================")
    print("SAVING DATABASE")
    print("==============================")


    candidate_id = None

    resume_id = None

    evaluation_id = None

    skill_gap_id = None


    try:

        # -------------------------------------------------
        # 18.1 CREATE CANDIDATE
        # -------------------------------------------------

        candidate_code = (
            f"CAND-{uuid.uuid4().hex[:8].upper()}"
        )

        candidate_id = save_candidate(
            candidate_code
        )


        print(
            "Candidate saved:",
            candidate_id
        )


        # -------------------------------------------------
        # 18.2 SAVE RESUME
        # -------------------------------------------------

        resume_id = save_resume(

            candidate_id,

            file.filename,

            extracted_text,

            clean_text

        )


        print(
            "Resume saved:",
            resume_id
        )


        # -------------------------------------------------
        # 18.3 SAVE EVALUATION
        # -------------------------------------------------

        evaluation_id = save_evaluation(

            resume_id,

            job["id"],

            int(round(score)),

            job_match[
                "match_percentage"
            ],

            summary,

            decision,

            ml_prediction,

            ml_confidence

        )


        print(
            "Evaluation saved:",
            evaluation_id
        )


        # -------------------------------------------------
        # 18.4 SAVE SKILL GAP
        # -------------------------------------------------

        try:

            skill_gap_id = save_skill_gap(

                candidate_id,

                matched_skills,

                missing_skills,

                recommendations

            )

            print(
                "Skill gap saved:",
                skill_gap_id
            )

        except Exception as skill_error:

            print(
                "Skill gap save error:",
                skill_error
            )

            skill_gap_id = None


    except Exception as error:

        print("\n==============================")
        print("DATABASE SAVE ERROR")
        print("==============================")

        print(
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save screening result: "
                + str(error)
            )
        )


    # =====================================================
    # STEP 19: FINAL RESPONSE
    # =====================================================

    print("\n==============================")
    print("SCREENING COMPLETED")
    print("==============================")

    print(
        "Candidate ID:",
        candidate_id
    )

    print(
        "Resume ID:",
        resume_id
    )

    print(
        "Evaluation ID:",
        evaluation_id
    )

    print(
        "Final Score:",
        score
    )

    print(
        "Decision:",
        decision
    )


    return {

        "message":
            "Resume uploaded and screened successfully.",

        "candidate_id":
            candidate_id,

        "candidate_code":
            candidate_code,

        "resume_id":
            resume_id,

        "evaluation_id":
            evaluation_id,

        # -------------------------------------------------
        # JOB
        # -------------------------------------------------

        "job": {

            "id":
                job["id"],

            "title":
                job["title"],

            "required_skills":
                required_skills

        },

        # -------------------------------------------------
        # SCORE
        # -------------------------------------------------

        "score":
            score,

        "resume_quality_score":
            resume_quality_score,

        "match_percentage":
            job_match[
                "match_percentage"
            ],

        "sbert_similarity":
            sbert_similarity,

        # -------------------------------------------------
        # SKILLS
        # -------------------------------------------------

        "job_match": {

            "matched_skills":
                job_match[
                    "matched_skills"
                ],

            "missing_skills":
                job_match[
                    "missing_skills"
                ],

            "match_percentage":
                job_match[
                    "match_percentage"
                ]

        },

        # -------------------------------------------------
        # SKILL GAP
        # -------------------------------------------------

        "skill_gap": {

            "matched_skills":
                matched_skills,

            "missing_skills":
                missing_skills,

            "recommendations":
                recommendations

        },

        "skill_gap_id":
            skill_gap_id,

        # -------------------------------------------------
        # AI DECISION
        # -------------------------------------------------

        "decision":
            decision,

        # -------------------------------------------------
        # ML
        # -------------------------------------------------

        "ml_prediction":
            ml_prediction,

        "ml_confidence":
            ml_confidence,

        # -------------------------------------------------
        # SYSTEM COMPARISON
        # -------------------------------------------------

        "systems_agree":
            systems_agree,

        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        "summary":
            summary,

        # -------------------------------------------------
        # JOB RECOMMENDATIONS
        # -------------------------------------------------

        "recommended_jobs":
            recommended_jobs

    }