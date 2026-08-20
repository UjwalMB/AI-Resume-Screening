def calculate_job_match(resume_text, required_skills):

    resume_text = resume_text.lower()

    matched_skills = []
    missing_skills = []

    for skill in required_skills:

        if skill.lower() in resume_text:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    total_skills = len(required_skills)

    if total_skills == 0:
        match_percentage = 0
    else:
        match_percentage = (
            len(matched_skills) / total_skills
        ) * 100

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": round(match_percentage, 2)
    }
def make_decision(score, match_percentage):
    if score >= 75 and match_percentage >= 70:
        return "SHORTLIST"

    elif score >= 50 and match_percentage >= 50:
        return "REVIEW"

    else:
        return "REJECT"