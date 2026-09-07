import re


SKILLS = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "C",

    "SQL",
    "MySQL",
    "PostgreSQL",

    "FastAPI",
    "REST API",
    "Flask",
    "Django",

    "React",
    "HTML",
    "CSS",

    "Git",
    "GitHub",
    "Docker",
    "AWS",

    "Pandas",
    "NumPy",
    "Scikit-learn",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "SBERT",

    "TensorFlow",
    "PyTorch",

    "Power BI",
    "Excel"
]


def extract_skills(resume_text):
    """
    Extract technical skills from the ORIGINAL resume text.

    Matching is case-insensitive and uses word boundaries
    so that partial words are not incorrectly matched.
    """

    if not resume_text:
        return []

    text = str(resume_text).lower()

    found_skills = []

    for skill in SKILLS:

        skill_lower = skill.lower()

        # Escape special characters such as +, ., -
        pattern = r"(?<!\w)" + re.escape(skill_lower) + r"(?!\w)"

        if re.search(pattern, text):
            found_skills.append(skill)

    # Remove duplicates while preserving order
    unique_skills = []

    for skill in found_skills:
        if skill not in unique_skills:
            unique_skills.append(skill)

    return unique_skills
