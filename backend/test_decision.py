from app.services.decision import calculate_job_match


resume_text = """
I am a Computer Science graduate.

Skills:
Python
JavaScript
SQL
Git

I have experience building web applications.
"""


required_skills = [
    "Python",
    "FastAPI",
    "SQL",
    "Git",
    "React"
]


result = calculate_job_match(
    resume_text,
    required_skills
)


print("----- JOB MATCH -----")

print("Matched Skills:")
print(result["matched_skills"])

print("\nMissing Skills:")
print(result["missing_skills"])

print("\nMatch Percentage:")
print(result["match_percentage"])

from app.services.decision import make_decision


test_cases = [
    (90, 85),
    (70, 65),
    (45, 40),
]


for score, match in test_cases:

    decision = make_decision(
        score,
        match
    )

    print(
        f"Score: {score}, "
        f"Match: {match}% "
        f"→ {decision}"
    )