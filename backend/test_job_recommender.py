from app.services.job_recommender import recommend_jobs


resume_text = """
I am a Computer Science graduate with experience
in Python, SQL, FastAPI, Git, Docker, Pandas,
NumPy and Machine Learning.
"""


jobs = recommend_jobs(
    resume_text,
    top_n=5
)


print("\n==============================")
print("   RECOMMENDED JOBS")
print("==============================")

for index, job in enumerate(jobs, start=1):

    print(f"\n{index}. {job['title']}")

    print(
        "Required Skills:",
        ", ".join(job["required_skills"])
    )

    print(
        "Matched Skills:",
        ", ".join(job["matched_skills"])
    )

    print(
        "Skill Match:",
        job["skill_match"],
        "%"
    )

    print(
        "SBERT Similarity:",
        job["sbert_similarity"],
        "%"
    )

    print(
        "Final Score:",
        job["final_score"],
        "%"
    )