from fastapi import APIRouter, UploadFile, File, HTTPException

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

import os
import uuid


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

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# GET JOB FROM DATABASE
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
                "required_skills": row[3] or ""
            }

    finally:

        connection.close()


# =========================================================
# CALCULATE SELECTED JOB SBERT SCORE
# =========================================================

def calculate_job_sbert_score(
    resume_text,
    job
):

    job_text = f"""
    Job Title:
    {job["title"]}

    Job Description:
    {job["description"]}

    Required Skills:
    {job["required_skills"]}
    """

    try:

        similarity = calculate_similarity(
            resume_text,
            job_text
        )

        return round(
            float(similarity),
            2
        )

    except Exception as error:

        print(
            "Selected job SBERT error:",
            error
        )

        return 0.0


# =========================================================
# CALCULATE FINAL JOB SCORE
# =========================================================

def calculate_final_job_score(
    skill_match,
    sbert_similarity,
    resume_quality
):

    # -----------------------------------------------------
    # WEIGHTS
    #
    # Skill Match       = 50%
    # SBERT Similarity  = 30%
    # Resume Quality    = 20%
    # -----------------------------------------------------

    final_score = (

        (skill_match * 0.50)

        +

        (sbert_similarity * 0.30)

        +

        (resume_quality * 0.20)

    )

    return round(
        min(final_score, 100),
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

    # =====================================================
    # STEP 1: VALIDATE FILE
    # =====================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )


    # =====================================================
    # STEP 2: GET SELECTED JOB
    # =====================================================

    job = get_job_by_id(
        job_id
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail=f"Job with ID {job_id} not found."
        )


    # =====================================================
    # STEP 3: PROCESS REQUIRED SKILLS
    # =====================================================

    required_skills = [

        skill.strip()

        for skill in job["required_skills"].split(",")

        if skill.strip()

    ]


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
        required_skills
    )


    # =====================================================
    # STEP 4: SAVE UPLOADED FILE
    # =====================================================

    unique_filename = (
        f"{uuid.uuid4().hex[:8]}_{file.filename}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    content = await file.read()

    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(content)


    # =====================================================
    # STEP 5: EXTRACT TEXT
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
            detail="Unable to extract text from the PDF."
        )


    # =====================================================
    # STEP 6: PREPROCESS TEXT
    # =====================================================

    clean_text = preprocess_text(
        extracted_text
    )


    # =====================================================
    # DEBUG: CHECK RESUME TEXT
    # =====================================================

    print("\n==============================")
    print("RESUME TEXT CHECK")
    print("==============================")

    print(
        "Resume characters:",
        len(clean_text)
    )


    # =====================================================
    # STEP 7: ML PREDICTION
    # =====================================================

    try:

        ml_result = predict_resume(
            clean_text
        )

        ml_prediction = ml_result.get(
            "prediction",
            "REVIEW"
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


    # =====================================================
    # STEP 8: SPLIT SENTENCES
    # =====================================================

    sentences = split_into_sentences(
        clean_text
    )


    # =====================================================
    # STEP 9: CLASSIFY SENTENCES
    # =====================================================

    classified_sentences = []

    for sentence in sentences:

        category = classify_sentence(
            sentence
        )

        classified_sentences.append({

            "sentence":
                sentence,

            "category":
                category

        })


    # =====================================================
    # STEP 10: CALCULATE RESUME QUALITY
    # =====================================================

    resume_quality_score = calculate_score(
        classified_sentences
    )


    print("\n==============================")
    print("RESUME QUALITY SCORE")
    print("==============================")

    print(
        "Resume Quality:",
        resume_quality_score
    )


    # =====================================================
    # STEP 11: GENERATE SUMMARY
    # =====================================================

    summary = generate_summary(
        classified_sentences
    )


    # =====================================================
    # STEP 12: CALCULATE JOB MATCH
    # =====================================================

    job_match = calculate_job_match(
        clean_text,
        required_skills
    )


    print("\n==============================")
    print("JOB MATCH")
    print("==============================")

    print(
        "Matched:",
        job_match["matched_skills"]
    )

    print(
        "Missing:",
        job_match["missing_skills"]
    )

    print(
        "Match %:",
        job_match["match_percentage"]
    )


    # =====================================================
    # STEP 13: CALCULATE SELECTED JOB SBERT
    # =====================================================

    sbert_similarity = calculate_job_sbert_score(
        clean_text,
        job
    )


    print("\n==============================")
    print("SBERT JOB SIMILARITY")
    print("==============================")

    print(
        "SBERT Similarity:",
        sbert_similarity
    )


    # =====================================================
    # STEP 14: CALCULATE FINAL JOB SCORE
    # =====================================================

    score = calculate_final_job_score(

        job_match["match_percentage"],

        sbert_similarity,

        resume_quality_score

    )


    print("\n==============================")
    print("FINAL JOB SCORE")
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
        "FINAL SCORE:",
        score
    )


    # =====================================================
    # STEP 15: FIND SKILL GAPS
    # =====================================================

    skill_gap = find_skill_gaps(
        clean_text,
        required_skills
    )


    # =====================================================
    # STEP 16: MAKE DECISION
    # =====================================================

    decision = make_decision(

        score,

        job_match["match_percentage"]

    )


    # =====================================================
    # STEP 17: COMPARE SYSTEMS
    # =====================================================

    systems_agree = (

        decision.upper()
        ==
        ml_prediction.upper()

    )


    # =====================================================
    # STEP 18: JOB RECOMMENDATIONS
    # =====================================================

    try:

        recommended_jobs = recommend_jobs(

            clean_text,

            top_n=5

        )

    except Exception as error:

        print(
            "Job recommendation error:",
            error
        )

        recommended_jobs = []


    # =====================================================
    # STEP 19: CANDIDATE CODE
    # =====================================================

    candidate_code = (

        f"CANDIDATE-"
        f"{uuid.uuid4().hex[:8].upper()}"

    )


    # =====================================================
    # STEP 20: SAVE CANDIDATE
    # =====================================================

    candidate_id = save_candidate(
        candidate_code
    )


    # =====================================================
    # STEP 21: SAVE RESUME
    # =====================================================

    resume_id = save_resume(

        candidate_id,

        file.filename,

        extracted_text,

        clean_text

    )


    # =====================================================
    # STEP 22: SAVE EVALUATION
    # =====================================================

    evaluation_id = save_evaluation(

        resume_id,

        job_id,

        score,

        job_match["match_percentage"],

        summary,

        decision,

        ml_prediction,

        ml_confidence

    )


    # =====================================================
    # STEP 23: SAVE SKILL GAP
    # =====================================================

    skill_gap_id = save_skill_gap(

        candidate_id,

        skill_gap.get(
            "matched_skills",
            []
        ),

        skill_gap.get(
            "missing_skills",
            []
        ),

        skill_gap.get(
            "recommendations",
            []
        )

    )


    # =====================================================
    # STEP 24: RETURN COMPLETE RESULT
    # =====================================================

    return {

        "message":
            "Resume processed and saved successfully",

        "candidate_id":
            candidate_id,

        "candidate_code":
            candidate_code,

        "resume_id":
            resume_id,

        "evaluation_id":
            evaluation_id,

        "skill_gap_id":
            skill_gap_id,

        "filename":
            file.filename,


        # =================================================
        # SELECTED JOB
        # =================================================

        "selected_job": {

            "job_id":
                job["id"],

            "title":
                job["title"],

            "description":
                job["description"],

            "required_skills":
                required_skills

        },


        # =================================================
        # SCREENING SCORES
        # =================================================

        "score":
            score,

        "resume_quality_score":
            resume_quality_score,

        "sbert_similarity":
            sbert_similarity,

        "summary":
            summary,

        "job_match":
            job_match,

        "decision":
            decision,


        # =================================================
        # ML
        # =================================================

        "ml_prediction":
            ml_prediction,

        "ml_confidence":
            ml_confidence,

        "systems_agree":
            systems_agree,


        # =================================================
        # SENTENCES
        # =================================================

        "sentences":
            classified_sentences,


        # =================================================
        # SKILL GAP
        # =================================================

        "skill_gap":
            skill_gap,


        # =================================================
        # RECOMMENDED JOBS
        # =================================================

        "recommended_jobs":
            recommended_jobs

    }