from app.services.sbert_service import (
    get_embedding,
    calculate_similarity
)


# =========================================================
# SAMPLE RESUME
# =========================================================

resume = """
I am a Computer Science graduate with experience
in Python, SQL, FastAPI, Git, Docker, Pandas,
NumPy and Machine Learning.
"""


# =========================================================
# SAMPLE JOB DESCRIPTION
# =========================================================

job = """
Python Developer required to develop backend applications
using Python, FastAPI, SQL and Git.
"""


# =========================================================
# CREATE SBERT EMBEDDINGS
# =========================================================

resume_embedding = get_embedding(resume)
job_embedding = get_embedding(job)


# =========================================================
# CALCULATE SEMANTIC SIMILARITY
# =========================================================

score = calculate_similarity(
    resume_embedding,
    job_embedding
)


# =========================================================
# DISPLAY RESULTS
# =========================================================

print("\n" + "=" * 50)
print("           SBERT JOB MATCH TEST")
print("=" * 50)

print(f"\nResume embedding shape : {resume_embedding.shape}")
print(f"Job embedding shape    : {job_embedding.shape}")

print(f"\nSBERT Similarity Score : {score}%")

if score >= 80:
    print("Match Level             : Excellent")
elif score >= 60:
    print("Match Level             : Good")
elif score >= 40:
    print("Match Level             : Moderate")
else:
    print("Match Level             : Low")

print("\n" + "=" * 50)