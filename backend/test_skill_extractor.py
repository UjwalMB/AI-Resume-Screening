from app.services.skill_extractor import extract_skills


resume_text = """
I have experience in Python, JavaScript, SQL,
HTML, CSS, Git, FastAPI, Pandas, NumPy
and Machine Learning.
"""


skills = extract_skills(resume_text)

print("Skills found:")

for skill in skills:
    print("-", skill)