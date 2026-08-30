from app.services.parser import extract_text_from_pdf
from app.services.preprocessing import preprocess_text
from app.services.decision import calculate_job_match
from app.services.skill_extractor import extract_skills


# =========================================================
# RESUME FILE
# =========================================================

resume_file = "uploads/961af37d_final resume.pdf"


# =========================================================
# REQUIRED JOB SKILLS
# =========================================================

required_skills = [
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Git"
]


# =========================================================
# EXTRACT PDF TEXT
# =========================================================

raw_text = extract_text_from_pdf(
    resume_file
)


# =========================================================
# PREPROCESS RESUME
# =========================================================

clean_text = preprocess_text(
    raw_text
)


# =========================================================
# EXTRACT RESUME SKILLS
# =========================================================

resume_skills = extract_skills(
    clean_text
)


print("\n==============================")
print("EXTRACTED RESUME SKILLS")
print("==============================")

print(resume_skills)


# =========================================================
# JOB MATCH
# =========================================================

result = calculate_job_match(
    clean_text,
    required_skills
)


# =========================================================
# DISPLAY RESULT
# =========================================================

print("\n==============================")
print("JOB MATCH RESULT")
print("==============================")

print("Matched Skills:")
print(result["matched_skills"])

print("\nMissing Skills:")
print(result["missing_skills"])

print("\nMatch Percentage:")
print(
    result["match_percentage"],
    "%"
)