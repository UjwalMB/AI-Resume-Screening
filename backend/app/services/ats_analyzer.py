import re


def _normalize_ats_text(text: str) -> str:
    """
    Normalize resume text for ATS analysis.
    """
    text = text or ""
    text = text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def analyze_ats_resume(
    resume_text: str,
    resume_skills=None,
    required_skills=None
):
    """
    Analyze a resume using ATS-style rules.

    This is an ATS compatibility analysis, not a guarantee
    that the resume will pass every external ATS.
    """

    resume_text = resume_text or ""
    normalized = _normalize_ats_text(resume_text)

    resume_skills = resume_skills or []
    required_skills = required_skills or []

    # ---------------------------------------------------------
    # 1. WORD COUNT
    # ---------------------------------------------------------

    # Correct regex: \b\w+\b
    words = re.findall(r"\b\w+\b", resume_text)
    word_count = len(words)

    # ---------------------------------------------------------
    # 2. CONTACT INFORMATION
    # ---------------------------------------------------------

    email_found = bool(
        re.search(
            r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            resume_text,
            re.IGNORECASE
        )
    )

    # General phone-number detection
    phone_found = bool(
        re.search(
            r"(?<!\d)"
            r"(?:\+\d{1,3}[\s.-]?)?"
            r"(?:\(?\d{2,4}\)?[\s.-]?)?"
            r"\d{3,4}[\s.-]?\d{3,4}"
            r"(?!\d)",
            resume_text
        )
    )

    linkedin_found = bool(
        re.search(
            r"\blinkedin\b",
            normalized
        )
    )

    github_found = bool(
        re.search(
            r"\bgithub\b",
            normalized
        )
    )

    contact_checks = {
        "email": email_found,
        "phone": phone_found,
        "linkedin": linkedin_found,
        "github": github_found
    }

    contact_score = (
        sum(contact_checks.values()) / len(contact_checks)
    ) * 100

    # ---------------------------------------------------------
    # 3. RESUME SECTIONS
    # ---------------------------------------------------------

    section_patterns = {
        "summary": [
            r"\bsummary\b",
            r"\bprofile\b",
            r"\bobjective\b"
        ],

        "skills": [
            r"\bskills?\b",
            r"\btechnical skills?\b"
        ],

        "education": [
            r"\beducation\b",
            r"\bacademic\b"
        ],

        "experience": [
            r"\bexperience\b",
            r"\bwork experience\b",
            r"\bprofessional experience\b"
        ],

        "projects": [
            r"\bprojects?\b",
            r"\bacademic projects?\b"
        ],

        "certifications": [
            r"\bcertifications?\b",
            r"\blicenses?\b"
        ]
    }

    detected_sections = {}

    for section, patterns in section_patterns.items():
        detected_sections[section] = any(
            re.search(pattern, normalized)
            for pattern in patterns
        )

    # Contact information section
    detected_sections["contact_information"] = (
        email_found
        or phone_found
        or linkedin_found
        or github_found
    )

    # ---------------------------------------------------------
    # 4. STRUCTURE SCORE
    # ---------------------------------------------------------

    important_sections = [
        "summary",
        "skills",
        "education",
        "experience",
        "projects"
    ]

    section_count = sum(
        detected_sections.get(section, False)
        for section in important_sections
    )

    structure_score = (
        section_count / len(important_sections)
    ) * 100

    # Bonus for contact information
    if detected_sections["contact_information"]:
        structure_score += 10

    structure_score = min(structure_score, 100)

    # ---------------------------------------------------------
    # 5. SKILLS SCORE
    # ---------------------------------------------------------

    resume_skill_names = [
        str(skill).strip().lower()
        for skill in resume_skills
        if skill
    ]

    required_skill_names = [
        str(skill).strip().lower()
        for skill in required_skills
        if skill
    ]

    matched_skills = []

    for skill in required_skill_names:
        if skill in resume_skill_names:
            matched_skills.append(skill)

    if required_skill_names:
        skills_score = (
            len(matched_skills) /
            len(required_skill_names)
        ) * 100
    else:
        # If no job skills are supplied, evaluate whether
        # the resume contains a skills section.
        skills_score = 100 if detected_sections["skills"] else 50

    # ---------------------------------------------------------
    # 6. KEYWORD MATCH
    # ---------------------------------------------------------

    matched_keywords = []
    missing_keywords = []

    for skill in required_skills:
        skill_text = str(skill).strip()

        if not skill_text:
            continue

        if re.search(
            rf"(?<!\w){re.escape(skill_text)}(?!\w)",
            normalized,
            re.IGNORECASE
        ):
            matched_keywords.append(skill_text)
        else:
            missing_keywords.append(skill_text)

    if required_skills:
        keyword_match = (
            len(matched_keywords) /
            len(required_skills)
        ) * 100
    else:
        keyword_match = 100

    # ---------------------------------------------------------
    # 7. LENGTH SCORE
    # ---------------------------------------------------------

    if 300 <= word_count <= 1000:
        length_score = 100

    elif 150 <= word_count < 300:
        length_score = 75

    elif 1000 < word_count <= 1200:
        length_score = 75

    elif 75 <= word_count < 150:
        length_score = 50

    elif 1200 < word_count <= 1500:
        length_score = 50

    else:
        length_score = 25

    # ---------------------------------------------------------
    # 8. ISSUES
    # ---------------------------------------------------------

    issues = []
    suggestions = []

    if not email_found:
        issues.append("Email address was not detected")
        suggestions.append(
            "Add a clearly visible professional email address"
        )

    if not phone_found:
        issues.append("Phone number was not detected")
        suggestions.append(
            "Add a clearly visible phone number"
        )

    if not linkedin_found:
        issues.append("LinkedIn profile was not detected")
        suggestions.append(
            "Add your LinkedIn profile URL"
        )

    if not github_found:
        issues.append("GitHub profile was not detected")
        suggestions.append(
            "Add your GitHub profile if relevant"
        )

    if not detected_sections["summary"]:
        issues.append("Professional summary was not detected")
        suggestions.append(
            "Add a short professional summary"
        )

    if not detected_sections["skills"]:
        issues.append("Skills section was not detected")
        suggestions.append(
            "Add a clearly labelled Skills section"
        )

    if not detected_sections["education"]:
        issues.append("Education section was not detected")
        suggestions.append(
            "Add a clearly labelled Education section"
        )

    if not detected_sections["projects"]:
        issues.append("Projects section was not detected")
        suggestions.append(
            "Add relevant academic or personal projects"
        )

    if word_count < 150:
        suggestions.append(
            "Add more relevant details about projects, skills, education, or experience"
        )

    if word_count > 1200:
        suggestions.append(
            "Consider shortening the resume and keeping only relevant information"
        )

    for skill in missing_keywords:
        suggestions.append(
            f"Consider adding the job keyword '{skill}' if you genuinely have that skill"
        )

    # Remove duplicate suggestions while preserving order
    suggestions = list(dict.fromkeys(suggestions))

    # ---------------------------------------------------------
    # 9. FINAL ATS SCORE
    # ---------------------------------------------------------

    ats_score = (
        structure_score * 0.35
        + contact_score * 0.20
        + skills_score * 0.20
        + length_score * 0.10
        + keyword_match * 0.15
    )

    ats_score = round(min(max(ats_score, 0), 100), 2)

    # ---------------------------------------------------------
    # 10. RESULT
    # ---------------------------------------------------------

    return {
        "ats_score": ats_score,
        "keyword_match": round(keyword_match, 2),
        "structure_score": round(structure_score, 2),
        "contact_score": round(contact_score, 2),
        "skills_score": round(skills_score, 2),
        "length_score": round(length_score, 2),
        "word_count": word_count,

        "detected_sections": detected_sections,

        "contact_checks": contact_checks,

        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,

        "issues": issues,
        "suggestions": suggestions
    }