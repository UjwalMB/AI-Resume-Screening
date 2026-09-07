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

from app.services.skill_extractor import extract_skills

from app.services.sbert_service import (
    get_embedding,
    calculate_similarity
)

from ml.ml_service import predict_resume


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
# HELPER
# =========================================================

def safe_float(value, default=0.0):

    try:

        return float(value)

    except Exception:

        return default


# =========================================================
# HELPER
# =========================================================

def safe_score(value):

    value = safe_float(value)

    return round(
        max(
            0,
            min(
                value,
                100
            )
        ),
        2
    )


# =========================================================
# NORMALIZE REQUIRED SKILLS
# =========================================================

def normalize_skills(required_skills):

    if required_skills is None:

        return []


    # PostgreSQL may return string
    if isinstance(
        required_skills,
        str
    ):

        text = required_skills.strip()


        # Try JSON first
        try:

            parsed = json.loads(text)

            if isinstance(
                parsed,
                list
            ):

                return [
                    str(skill).strip()
                    for skill in parsed
                    if str(skill).strip()
                ]

        except Exception:

            pass


        # Otherwise comma-separated
        return [
            skill.strip()
            for skill in text.split(",")
            if skill.strip()
        ]


    if isinstance(
        required_skills,
        list
    ):

        return [
            str(skill).strip()
            for skill in required_skills
            if str(skill).strip()
        ]


    return []


# =========================================================
# CALCULATE SBERT JOB SCORE
# =========================================================

def calculate_job_sbert_score(
    resume_text,
    job
):

    try:

        required_skills = normalize_skills(
            job.get(
                "required_skills",
                []
            )
        )


        job_text = " ".join([

            str(
                job.get(
                    "title",
                    ""
                )
            ),

            str(
                job.get(
                    "description",
                    ""
                )
            ),

            " ".join(
                required_skills
            )

        ])


        # -------------------------------------------------
        # IMPORTANT:
        # calculate_similarity() expects embeddings
        # -------------------------------------------------

        resume_embedding = get_embedding(
            resume_text
        )

        job_embedding = get_embedding(
            job_text
        )


        similarity = calculate_similarity(

            resume_embedding,

            job_embedding

        )


        similarity = safe_score(
            similarity
        )


        return similarity


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

        (safe_float(skill_match) * 0.40)

        +

        (safe_float(sbert_similarity) * 0.30)

        +

        (safe_float(resume_quality) * 0.20)

        +

        (safe_float(ml_confidence) * 0.10)

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
    file: UploadFile = File(...)
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
    # STEP 2: SAVE PDF
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

            buffer.write(
                content
            )


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
    # STEP 3: EXTRACT PDF TEXT
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
    # STEP 4: PREPROCESS
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

        clean_text = extracted_text


    print(
        "Clean text characters:",
        len(clean_text)
    )


    # =====================================================
    # STEP 5: ML PREDICTION
    # =====================================================

    ml_prediction = "REVIEW"

    ml_confidence = 0.0


    try:

        ml_result = predict_resume(

            clean_text

        )


        if isinstance(

            ml_result,

            dict

        ):

            ml_prediction = str(

                ml_result.get(

                    "prediction",

                    "REVIEW"

                )

            )


            ml_confidence = safe_score(

                ml_result.get(

                    "confidence",

                    0

                )

            )


        else:

            ml_prediction = str(

                ml_result

            )


    except Exception as error:

        print(
            "ML prediction error:",
            error
        )


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
    # STEP 6: SPLIT SENTENCES
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


    if not sentences:

        sentences = [
            clean_text
        ]


    # =====================================================
    # STEP 7: CLASSIFY SENTENCES
    # =====================================================

    classified_sentences = []


    for sentence in sentences:

        if not sentence:

            continue


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


    print(
        "Classified sentences:",
        len(classified_sentences)
    )


    # =====================================================
    # STEP 8: RESUME QUALITY SCORE
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


    resume_quality_score = safe_score(

        resume_quality_score

    )


    print("\n==============================")
    print("RESUME QUALITY")
    print("==============================")


    print(
        "Resume Quality:",
        resume_quality_score
    )


    # =====================================================
    # STEP 9: SUMMARY
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
    # STEP 10: EXTRACT RESUME SKILLS
    # =====================================================

    try:

        resume_skills = extract_skills(

            extracted_text

        )


    except Exception as error:

        print(
            "Skill extraction error:",
            error
        )

        resume_skills = []


    if resume_skills is None:

        resume_skills = []


    resume_skills = list(

        dict.fromkeys(

            [

                str(skill).strip()

                for skill in resume_skills

                if str(skill).strip()

            ]

        )

    )


    print("\n==============================")
    print("DETECTED SKILLS")
    print("==============================")


    for skill in resume_skills:

        print(
            "✓",
            skill
        )


    # =====================================================
    # STEP 11: JOB RECOMMENDATIONS
    # =====================================================

    print("\n")
    print("=" * 60)
    print("GENERATING JOB RECOMMENDATIONS")
    print("=" * 60)


    try:

        recommended_jobs = recommend_jobs(

            extracted_text,

            top_n=5

        )


    except Exception as error:

        print(
            "Job recommendation error:",
            error
        )

        recommended_jobs = []


    if recommended_jobs is None:

        recommended_jobs = []


    print("\n==============================")
    print("TOP JOB RECOMMENDATIONS")
    print("==============================")


    for index, recommendation in enumerate(

        recommended_jobs,

        start=1

    ):

        if not isinstance(

            recommendation,

            dict

        ):

            continue


        print(

            f"{index}.",

            recommendation.get(

                "title",

                "Unknown Job"

            )

        )


        print(

            "   Job ID:",

            recommendation.get(

                "job_id",

                recommendation.get(

                    "id",

                    "N/A"

                )

            )

        )


        print(

            "   Skill Match:",

            recommendation.get(

                "skill_match",

                0

            ),

            "%"

        )


        print(

            "   SBERT Similarity:",

            recommendation.get(

                "sbert_similarity",

                0

            ),

            "%"

        )


        print(

            "   Final Score:",

            recommendation.get(

                "final_score",

                0

            ),

            "%"

        )


        print(

            "   Matched Skills:",

            recommendation.get(

                "matched_skills",

                []

            )

        )


        print(

            "   Missing Skills:",

            recommendation.get(

                "missing_skills",

                []

            )

        )


    # =====================================================
    # STEP 12: SELECT BEST JOB
    # =====================================================

    if not recommended_jobs:

        raise HTTPException(

            status_code=404,

            detail=(

                "No jobs are available for recommendation. "

                "Please add jobs to the jobs table."

            )

        )


    best_job = None


    for recommendation in recommended_jobs:

        if isinstance(

            recommendation,

            dict

        ):

            best_job = recommendation

            break


    if not best_job:

        raise HTTPException(

            status_code=404,

            detail="Unable to determine the best job recommendation."

        )


    print("\n==============================")
    print("BEST JOB")
    print("==============================")


    print(

        "Job:",

        best_job.get(

            "title",

            "Unknown"

        )

    )


    # =====================================================
    # STEP 13: BEST JOB ID
    # =====================================================

    job_id = best_job.get(

        "job_id",

        best_job.get(

            "id",

            None

        )

    )


    if job_id is None:

        raise HTTPException(

            status_code=500,

            detail=(

                "Job recommendation does not contain a job ID."

            )

        )


    # =====================================================
    # STEP 14: BEST JOB INFORMATION
    # =====================================================

    job_title = best_job.get(

        "title",

        "Unknown Job"

    )


    job_description = best_job.get(

        "description",

        ""

    )


    required_skills = normalize_skills(

        best_job.get(

            "required_skills",

            []

        )

    )


    # =====================================================
    # STEP 15: JOB SKILL MATCH
    # =====================================================

    print("\n==============================")
    print("JOB SKILL MATCH")
    print("==============================")


    try:

        job_match = calculate_job_match(

            extracted_text,

            required_skills

        )


    except Exception as error:

        print(
            "Job match error:",
            error
        )

        job_match = {

            "matched_skills":
                best_job.get(

                    "matched_skills",

                    []

                ),

            "missing_skills":
                best_job.get(

                    "missing_skills",

                    required_skills

                ),

            "match_percentage":
                best_job.get(

                    "skill_match",

                    0

                )

        }


    matched_skills = job_match.get(

        "matched_skills",

        []

    )


    missing_skills = job_match.get(

        "missing_skills",

        []

    )


    match_percentage = safe_score(

        job_match.get(

            "match_percentage",

            best_job.get(

                "skill_match",

                0

            )

        )

    )


    print(
        "Matched:",
        matched_skills
    )


    print(
        "Missing:",
        missing_skills
    )


    print(
        "Match:",
        match_percentage
    )


    # =====================================================
    # STEP 16: SBERT SCORE
    # =====================================================

    job_for_sbert = {

        "title":
            job_title,

        "description":
            job_description,

        "required_skills":
            required_skills

    }


    sbert_similarity = calculate_job_sbert_score(

        extracted_text,

        job_for_sbert

    )


    # If recommender already calculated SBERT,
    # use its value when available.

    if best_job.get(

        "sbert_similarity",

        None

    ) is not None:

        sbert_similarity = safe_score(

            best_job.get(

                "sbert_similarity",

                sbert_similarity

            )

        )


    print("\n==============================")
    print("SBERT")
    print("==============================")


    print(

        "SBERT Similarity:",

        sbert_similarity

    )


    # =====================================================
    # STEP 17: FINAL SCORE
    # =====================================================

    score = calculate_final_job_score(

        match_percentage,

        sbert_similarity,

        resume_quality_score,

        ml_confidence

    )


    print("\n==============================")
    print("FINAL SCORE")
    print("==============================")


    print(
        "Skill Match:",
        match_percentage
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
    # STEP 18: SKILL GAP
    # =====================================================

    try:

        skill_gap_result = find_skill_gaps(

            extracted_text,

            required_skills

        )


        if isinstance(

            skill_gap_result,

            dict

        ):

            matched_skills = skill_gap_result.get(

                "matched_skills",

                matched_skills

            )


            missing_skills = skill_gap_result.get(

                "missing_skills",

                missing_skills

            )


            recommendations = skill_gap_result.get(

                "recommendations",

                []

            )


        else:

            recommendations = []


    except Exception as error:

        print(
            "Skill gap error:",
            error
        )

        recommendations = []


    # =====================================================
    # STEP 19: DECISION
    # =====================================================

    try:

        decision = make_decision(

            score,

            match_percentage

        )


    except Exception as error:

        print(
            "Decision error:",
            error
        )

        decision = "REVIEW"


    systems_agree = (

        str(decision).upper()

        ==

        str(ml_prediction).upper()

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
    # STEP 20: DATABASE SAVE
    # =====================================================

    print("\n==============================")
    print("SAVING DATABASE")
    print("==============================")


    candidate_id = None

    resume_id = None

    evaluation_id = None

    skill_gap_id = None


    candidate_code = (

        f"CAND-"

        f"{uuid.uuid4().hex[:8].upper()}"

    )


    try:

        # -------------------------------------------------
        # SAVE CANDIDATE
        # -------------------------------------------------

        candidate_id = save_candidate(

            candidate_code

        )


        print(

            "Candidate saved:",

            candidate_id

        )


        # -------------------------------------------------
        # SAVE RESUME
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
        # SAVE EVALUATION
        # -------------------------------------------------

        evaluation_id = save_evaluation(

            resume_id,

            job_id,

            int(
                round(score)
            ),

            match_percentage,

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
        # SAVE SKILL GAP
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


        except Exception as error:

            print(

                "Skill gap save error:",

                error

            )


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
    # STEP 21: FINAL RESPONSE
    # =====================================================

    print("\n")
    print("=" * 60)
    print("RESUME SCREENING COMPLETED")
    print("=" * 60)


    return {

        "success":
            True,

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
        # RESUME
        # -------------------------------------------------

        "filename":
            file.filename,

        "saved_file":
            unique_filename,

        # -------------------------------------------------
        # RESUME SCORE
        # -------------------------------------------------

        "score":
            score,

        "resume_quality_score":
            resume_quality_score,

        # -------------------------------------------------
        # SKILLS
        # -------------------------------------------------

        "skills":
            resume_skills,

        "skill_count":
            len(resume_skills),

        # -------------------------------------------------
        # JOB MATCH
        # -------------------------------------------------

        "job_match_score":
            match_percentage,

        "sbert_similarity":
            sbert_similarity,

        "job":
            {

                "id":
                    job_id,

                "title":
                    job_title,

                "description":
                    job_description,

                "required_skills":
                    required_skills

            },

        "job_match":
            {

                "matched_skills":
                    matched_skills,

                "missing_skills":
                    missing_skills,

                "match_percentage":
                    match_percentage

            },

        # -------------------------------------------------
        # SKILL GAP
        # -------------------------------------------------

        "skill_gap":
            {

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
        # ML
        # -------------------------------------------------

        "ml_prediction":
            ml_prediction,

        "ml_confidence":
            ml_confidence,

        # -------------------------------------------------
        # DECISION
        # -------------------------------------------------

        "decision":
            decision,

        "systems_agree":
            systems_agree,

        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        "summary":
            summary,

        # -------------------------------------------------
        # TOP 5 JOBS
        # -------------------------------------------------

        "recommended_jobs":
            recommended_jobs,

        "top_jobs":
            recommended_jobs[:5]

    }