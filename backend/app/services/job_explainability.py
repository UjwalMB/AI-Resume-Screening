
def build_job_match_explanation(
    matched_skills,
    missing_skills,
    required_skills,
    skill_match,
    sbert_similarity,
    final_score,
):
    matched_skills = list(matched_skills or [])
    missing_skills = list(missing_skills or [])
    required_skills = list(required_skills or [])

    skill_match = float(skill_match or 0)
    sbert_similarity = float(sbert_similarity or 0)
    final_score = float(final_score or 0)

    required_count = len(required_skills)
    matched_count = len(matched_skills)
    missing_count = len(missing_skills)

    # -----------------------------------------------------
    # MATCH LEVEL
    # -----------------------------------------------------

    if final_score >= 75:
        match_level = "Strong Match"
    elif final_score >= 60:
        match_level = "Good Match"
    elif final_score >= 45:
        match_level = "Moderate Match"
    else:
        match_level = "Low Match"

    # -----------------------------------------------------
    # SCORE CONTRIBUTION
    # -----------------------------------------------------

    # Current recommender formula:
    # Skill Match = 60%
    # SBERT = 40%

    skill_contribution = round(skill_match * 0.60, 2)
    sbert_contribution = round(sbert_similarity * 0.40, 2)

    # -----------------------------------------------------
    # SBERT INTERPRETATION
    # -----------------------------------------------------

    if sbert_similarity >= 75:
        semantic_summary = (
            "The resume is highly semantically aligned with this job."
        )
    elif sbert_similarity >= 50:
        semantic_summary = (
            "The resume has moderate semantic alignment with this job."
        )
    else:
        semantic_summary = (
            "The resume has limited semantic alignment with this job."
        )

    # -----------------------------------------------------
    # REASONS
    # -----------------------------------------------------

    reasons = []

    reasons.append(
        f"Matched {matched_count} of {required_count} required skills."
    )

    reasons.append(
        f"Skill matching contributed {skill_contribution:.2f} points "
        "to the job score."
    )

    reasons.append(
        f"SBERT semantic similarity is {sbert_similarity:.2f}%, "
        f"contributing {sbert_contribution:.2f} points."
    )

    reasons.append(semantic_summary)

    # -----------------------------------------------------
    # MATCHED SKILLS
    # -----------------------------------------------------

    if matched_skills:
        reasons.append(
            "Key matching skills: "
            + ", ".join(matched_skills[:5])
            + "."
        )

    # -----------------------------------------------------
    # MISSING SKILLS
    # -----------------------------------------------------

    if missing_skills:
        reasons.append(
            "Main skill gaps: "
            + ", ".join(missing_skills[:5])
            + "."
        )
    else:
        reasons.append(
            "No required skills are currently missing."
        )

    # -----------------------------------------------------
    # WHY MATCH
    # -----------------------------------------------------

    if required_count:
        why_match = (
            f"{match_level}: "
            f"{matched_count}/{required_count} required skills matched "
            f"with {sbert_similarity:.2f}% semantic similarity."
        )
    else:
        why_match = (
            f"{match_level}: "
            f"SBERT semantic similarity is {sbert_similarity:.2f}%."
        )

    # -----------------------------------------------------
    # IMPROVEMENT TIP
    # -----------------------------------------------------

    if missing_skills:
        improvement_tip = (
            "Add evidence of "
            + ", ".join(missing_skills[:3])
            + " to improve this match."
        )
    else:
        improvement_tip = (
            "Keep the matched skills clearly visible in the resume."
        )

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "match_level": match_level,
        "match_percentage": round(skill_match, 2),
        "matched_skill_count": matched_count,
        "required_skill_count": required_count,
        "missing_skill_count": missing_count,
        "score_breakdown": {
            "skill_match_weight": 60,
            "sbert_weight": 40,
            "skill_contribution": skill_contribution,
            "sbert_contribution": sbert_contribution,
        },
        "reasons": reasons,
        "why_match": why_match,
        "improvement_tip": improvement_tip,
    }

