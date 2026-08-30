import re


SKILLS = [
    "Python",
    "JavaScript",
    "Java",
    "C++",
    "C",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "FastAPI",
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

    text = resume_text.lower()

    found_skills = []

    for skill in SKILLS:

        pattern = r"(?<!\w)" + re.escape(
            skill.lower()
        ) + r"(?!\w)"

        if re.search(pattern, text):

            found_skills.append(skill)

    return found_skills