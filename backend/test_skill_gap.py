from app.services.skill_gap import find_skill_gaps


resume_text = """
I have experience with Python, SQL and Git.
I have built backend applications.
"""


required_skills = [
    "Python",
    "FastAPI",
    "SQL",
    "Git",
    "Docker"
]


result = find_skill_gaps(
    resume_text,
    required_skills
)


print("----- MATCHED SKILLS -----")

for skill in result["matched_skills"]:
    print("✓", skill)


print("\n----- MISSING SKILLS -----")

for skill in result["missing_skills"]:
    print("✗", skill)


print("\n----- RECOMMENDATIONS -----")

for item in result["recommendations"]:

    print(
        f"{item['skill']}: "
        f"{item['recommendation']}"
    )