SKILL_RECOMMENDATIONS = {
    "python": "Practice Python programming, data structures, and backend development.",
    "fastapi": "Learn FastAPI fundamentals, REST APIs, routing, and request handling.",
    "sql": "Practice SQL queries, joins, aggregation, and database design.",
    "git": "Learn Git fundamentals, branching, commits, merging, and GitHub workflows.",
    "docker": "Learn Docker images, containers, Dockerfiles, and basic deployment.",
    "react": "Learn React components, props, state, hooks, and API integration.",
    "javascript": "Practice JavaScript ES6+, DOM manipulation, asynchronous programming, and APIs.",
    "django": "Learn Django models, views, URLs, templates, and REST APIs.",
    "aws": "Learn AWS fundamentals including EC2, S3, IAM, and basic cloud deployment."
}


def find_skill_gaps(resume_text, required_skills):

    resume_text = resume_text.lower()

    matched_skills = []
    missing_skills = []

    for skill in required_skills:

        skill_clean = skill.strip()

        if not skill_clean:
            continue

        if skill_clean.lower() in resume_text:
            matched_skills.append(skill_clean)
        else:
            missing_skills.append(skill_clean)

    recommendations = []

    for skill in missing_skills:

        recommendation = SKILL_RECOMMENDATIONS.get(
            skill.lower(),
            f"Develop practical skills in {skill} through projects and hands-on practice."
        )

        recommendations.append({
            "skill": skill,
            "recommendation": recommendation
        })

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendations": recommendations
    }