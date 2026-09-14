from app.services.skill_extractor import extract_skills


# =========================================================
# NORMALIZE SKILL NAME
# =========================================================

def normalize_skill(skill):

    skill = skill.strip().lower()

    aliases = {
        # React
        "reactjs": "react",
        "react.js": "react",
        "react js": "react",

        # JavaScript
        "javascript": "javascript",
        "java script": "javascript",
        "js": "javascript",

        # FastAPI
        "fastapi": "fastapi",
        "fast api": "fastapi",
        "fast-api": "fastapi",

        # PostgreSQL
        "postgres": "postgresql",
        "postgre": "postgresql",

        # Node
        "nodejs": "node.js",
        "node js": "node.js",

        # Git
        "github": "github",
        "git": "git"
    }

    return aliases.get(skill, skill)


# =========================================================
# CALCULATE JOB MATCH
# =========================================================

def calculate_job_match(
    resume_text,
    required_skills
):

    resume_skills = extract_skills(resume_text)

    print("\n==============================")
    print("EXTRACTED RESUME SKILLS")
    print("==============================")
    print(resume_skills)

    # -----------------------------------------------------
    # Normalize resume skills
    # -----------------------------------------------------

    resume_skills_normalized = set()

    for skill in resume_skills:

        normalized = normalize_skill(skill)

        resume_skills_normalized.add(normalized)

    print("\n==============================")
    print("NORMALIZED RESUME SKILLS")
    print("==============================")
    print(sorted(resume_skills_normalized))

    # -----------------------------------------------------
    # Prepare result lists
    # -----------------------------------------------------

    matched_skills = []
    missing_skills = []

    # -----------------------------------------------------
    # Check required skills
    # -----------------------------------------------------

    for skill in required_skills:

        skill_clean = skill.strip()

        if not skill_clean:
            continue

        normalized_required_skill = normalize_skill(
            skill_clean
        )

        print(
            f"Checking job skill: "
            f"{skill_clean} -> "
            f"{normalized_required_skill}"
        )

        if normalized_required_skill in resume_skills_normalized:

            matched_skills.append(skill_clean)

        else:

            missing_skills.append(skill_clean)

    # -----------------------------------------------------
    # Calculate match percentage
    # -----------------------------------------------------

    total_skills = (
        len(matched_skills)
        +
        len(missing_skills)
    )

    if total_skills == 0:

        match_percentage = 0

    else:

        match_percentage = (
            len(matched_skills)
            /
            total_skills
        ) * 100

    print("\n==============================")
    print("FINAL JOB MATCH")
    print("==============================")

    print(
        "Matched Skills:",
        matched_skills
    )

    print(
        "Missing Skills:",
        missing_skills
    )

    print(
        "Match Percentage:",
        round(match_percentage, 2)
    )

    return {

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "match_percentage":
            round(match_percentage, 2)

    }


# =========================================================
# MAKE SCREENING DECISION
# =========================================================

def make_decision(
    score,
    match_percentage
):

    score = float(score or 0)
    match_percentage = float(match_percentage or 0)

    # -----------------------------------------------------
    # SHORTLIST
    #
    # Strong overall score + strong job match
    # -----------------------------------------------------

    if (
        score >= 75
        and
        match_percentage >= 70
    ):

        return "SHORTLIST"

    # -----------------------------------------------------
    # REJECT
    #
    # Very weak overall score OR very poor job match
    # -----------------------------------------------------

    if (
        score < 50
        or
        match_percentage < 40
    ):

        return "REJECT"

    # -----------------------------------------------------
    # REVIEW
    #
    # Borderline candidates
    # -----------------------------------------------------

    return "REVIEW"