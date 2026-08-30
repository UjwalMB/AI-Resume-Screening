from app.database import get_connection

from app.services.sbert_service import (
    get_embedding,
    calculate_similarity
)

from app.services.skill_extractor import extract_skills


# =========================================================
# JOB EMBEDDING CACHE
# =========================================================

_job_embedding_cache = {}


# =========================================================
# JOB RECOMMENDATION
# =========================================================

def recommend_jobs(resume_text, top_n=5):

    # =====================================================
    # 1. EXTRACT RESUME SKILLS
    # =====================================================

    resume_skills = extract_skills(
        resume_text
    )

    resume_skills_lower = {
        skill.strip().lower()
        for skill in resume_skills
        if skill.strip()
    }

    print("\n==============================")
    print("RESUME SKILLS")
    print("==============================")

    for skill in resume_skills:
        print("-", skill)


    # =====================================================
    # 2. CREATE RESUME EMBEDDING ONCE
    # =====================================================

    print("\nCreating resume SBERT embedding...")

    resume_embedding = get_embedding(
        resume_text
    )

    print("Resume embedding created.")


    # =====================================================
    # 3. DATABASE CONNECTION
    # =====================================================

    connection = get_connection()
    cursor = connection.cursor()

    try:

        # =================================================
        # 4. GET ALL JOBS
        # =================================================

        cursor.execute(
            """
            SELECT
                id,
                title,
                description,
                required_skills
            FROM jobs
            ORDER BY id ASC;
            """
        )

        rows = cursor.fetchall()

        recommendations = []


        # =================================================
        # 5. PROCESS EACH JOB
        # =================================================

        for row in rows:

            job_id = row[0]
            title = row[1]
            description = row[2] or ""
            required_skills_text = row[3] or ""


            # =============================================
            # REQUIRED SKILLS
            # =============================================

            required_skills = [
                skill.strip()
                for skill in required_skills_text.split(",")
                if skill.strip()
            ]


            # =============================================
            # MATCH SKILLS
            # =============================================

            matched_skills = []
            missing_skills = []

            for skill in required_skills:

                if skill.lower() in resume_skills_lower:

                    matched_skills.append(
                        skill
                    )

                else:

                    missing_skills.append(
                        skill
                    )


            # =============================================
            # SKILL MATCH %
            # =============================================

            if required_skills:

                skill_match = (
                    len(matched_skills)
                    /
                    len(required_skills)
                ) * 100

            else:

                skill_match = 0


            # =============================================
            # CREATE JOB TEXT
            # =============================================

            job_text = f"""
Job Title:
{title}

Job Description:
{description}

Required Skills:
{required_skills_text}
"""


            # =============================================
            # SBERT EMBEDDING CACHE
            # =============================================

            if job_id not in _job_embedding_cache:

                print(
                    f"Creating SBERT embedding for job {job_id}..."
                )

                _job_embedding_cache[
                    job_id
                ] = get_embedding(
                    job_text
                )

            else:

                print(
                    f"Using cached embedding for job {job_id}"
                )


            job_embedding = (
                _job_embedding_cache[job_id]
            )


            # =============================================
            # SBERT SIMILARITY
            # =============================================

            try:

                sbert_score = calculate_similarity(
                    resume_embedding,
                    job_embedding
                )

            except Exception as error:

                print(
                    f"SBERT error for job {job_id}:",
                    error
                )

                sbert_score = 0


            # =============================================
            # FINAL SCORE
            # =============================================
            #
            # 60% Skill Match
            # 40% SBERT Similarity
            #

            final_score = (
                (skill_match * 0.60)
                +
                (sbert_score * 0.40)
            )


            # =============================================
            # SAVE RESULT
            # =============================================

            recommendations.append({

                "job_id": job_id,

                "title": title,

                "description": description,

                "required_skills":
                    required_skills,

                "matched_skills":
                    matched_skills,

                "missing_skills":
                    missing_skills,

                "skill_match":
                    round(
                        skill_match,
                        2
                    ),

                "sbert_similarity":
                    round(
                        sbert_score,
                        2
                    ),

                "final_score":
                    round(
                        final_score,
                        2
                    )

            })


        # =================================================
        # 6. SORT JOBS
        # =================================================

        recommendations.sort(
            key=lambda job:
                job["final_score"],
            reverse=True
        )


        # =================================================
        # 7. PRINT RECOMMENDATIONS
        # =================================================

        print("\n==============================")
        print("RECOMMENDED JOBS")
        print("==============================")


        for index, job in enumerate(
            recommendations[:top_n],
            start=1
        ):

            print(
                f"\n{index}. {job['title']}"
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

            print(
                "Matched Skills:",
                job["matched_skills"]
            )

            print(
                "Missing Skills:",
                job["missing_skills"]
            )


        # =================================================
        # 8. RETURN TOP JOBS
        # =================================================

        return recommendations[:top_n]


    finally:

        cursor.close()

        connection.close()