from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from app.auth import require_authentication

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
# UPLOAD + SCREEN RESUME
# =========================================================

@router.post("/upload")
async def upload_resume(

    file: UploadFile = File(...),

    required_skills: str = "",

    job_id: int = 1,

    authenticated: bool = Depends(
        require_authentication
    )
):

    # =====================================================
    # STEP 0: VALIDATE FILE
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
    # STEP 1: SAVE UPLOADED FILE
    # =====================================================

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    content = await file.read()

    with open(
        file_path,
        "wb"
    ) as buffer:
        buffer.write(content)


    # =====================================================
    # STEP 2: EXTRACT TEXT FROM PDF
    # =====================================================

    extracted_text = extract_text_from_pdf(
        file_path
    )

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from the PDF."
        )


    # =====================================================
    # STEP 3: REMOVE PII / PREPROCESS TEXT
    # =====================================================

    clean_text = preprocess_text(
        extracted_text
    )


    # =====================================================
    # STEP 4: SPLIT TEXT INTO SENTENCES
    # =====================================================

    sentences = split_into_sentences(
        clean_text
    )


    # =====================================================
    # STEP 5: CLASSIFY SENTENCES
    # =====================================================

    classified_sentences = []

    for sentence in sentences:

        category = classify_sentence(
            sentence
        )

        classified_sentences.append({
            "sentence": sentence,
            "category": category
        })


    # =====================================================
    # STEP 6: CALCULATE RESUME SCORE
    # =====================================================

    score = calculate_score(
        classified_sentences
    )


    # =====================================================
    # STEP 7: GENERATE SUMMARY
    # =====================================================

    summary = generate_summary(
        classified_sentences
    )


    # =====================================================
    # STEP 8: PROCESS REQUIRED SKILLS
    # =====================================================

    skills = [
        skill.strip()
        for skill in required_skills.split(",")
        if skill.strip()
    ]


    # =====================================================
    # STEP 9: CALCULATE JOB MATCH
    # =====================================================

    job_match = calculate_job_match(
        clean_text,
        skills
    )


    # =====================================================
    # STEP 10: FIND SKILL GAPS
    # =====================================================

    skill_gap = find_skill_gaps(
        clean_text,
        skills
    )


    # =====================================================
    # STEP 11: MAKE DECISION
    # =====================================================

    decision = make_decision(
        score,
        job_match["match_percentage"]
    )


    # =====================================================
    # STEP 12: GENERATE UNIQUE CANDIDATE CODE
    # =====================================================

    candidate_code = (
        f"CANDIDATE-{uuid.uuid4().hex[:8].upper()}"
    )


    # =====================================================
    # STEP 13: SAVE CANDIDATE
    # =====================================================

    candidate_id = save_candidate(
        candidate_code
    )


    # =====================================================
    # STEP 14: SAVE RESUME
    # =====================================================

    resume_id = save_resume(
        candidate_id,
        file.filename,
        extracted_text,
        clean_text
    )


    # =====================================================
    # STEP 15: SAVE EVALUATION
    # =====================================================

    evaluation_id = save_evaluation(
        resume_id,
        job_id,
        score,
        job_match["match_percentage"],
        summary,
        decision
    )


    # =====================================================
    # STEP 16: SAVE SKILL GAP
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
    # STEP 17: RETURN RESULT
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

        "score":
            score,

        "summary":
            summary,

        "job_match":
            job_match,

        "decision":
            decision,

        "sentences":
            classified_sentences,

        "skill_gap":
            skill_gap
    }