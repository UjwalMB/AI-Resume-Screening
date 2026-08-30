from app.services.sbert_service import calculate_similarity


resume = """
I am a Computer Science graduate with experience
in Python, SQL, FastAPI, Git, Docker, Pandas,
NumPy and Machine Learning.
"""


job = """
Python Developer required to develop backend applications
using Python, FastAPI, SQL and Git.
"""


score = calculate_similarity(
    resume,
    job
)

print("SBERT Similarity:", score, "%")