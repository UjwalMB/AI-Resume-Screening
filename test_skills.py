import re

# Load skills
with open("data/skills.txt", "r") as file:
    skills = [line.strip() for line in file if line.strip()]

# Sample resume text for testing
resume_text = """
I am a Computer Science graduate with experience in Python,
SQL, Pandas, NumPy, Machine Learning and Flask.
I also know Git and GitHub.
"""

# Convert resume text to lowercase
resume_text = resume_text.lower()

# Find skills
found_skills = []

for skill in skills:
    if skill.lower() in resume_text:
        found_skills.append(skill)

print("Skills found in resume:")
for skill in found_skills:
    print("-", skill)