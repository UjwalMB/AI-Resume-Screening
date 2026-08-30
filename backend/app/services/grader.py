def calculate_score(classified_sentences):
    """
    Calculate overall resume quality score.

    This score measures resume completeness/quality.
    It is NOT the job match score.
    """

    categories = {
        "skills": 0,
        "experience": 0,
        "education": 0,
        "certification": 0,
        "summary": 0,
        "objectives": 0,
        "personal_information": 0
    }

    for item in classified_sentences:

        category = item.get("category")

        if category in categories:
            categories[category] += 1

    score = 0

    # =====================================================
    # SKILLS
    # Maximum: 25 points
    # =====================================================

    if categories["skills"] >= 3:
        score += 25

    elif categories["skills"] == 2:
        score += 20

    elif categories["skills"] == 1:
        score += 12

    # =====================================================
    # EXPERIENCE / PROJECTS
    # Maximum: 25 points
    # =====================================================

    if categories["experience"] >= 3:
        score += 25

    elif categories["experience"] == 2:
        score += 20

    elif categories["experience"] == 1:
        score += 12

    # =====================================================
    # EDUCATION
    # Maximum: 20 points
    # =====================================================

    if categories["education"] >= 2:
        score += 20

    elif categories["education"] == 1:
        score += 15

    # =====================================================
    # CERTIFICATIONS
    # Maximum: 10 points
    # =====================================================

    if categories["certification"] >= 2:
        score += 10

    elif categories["certification"] == 1:
        score += 7

    # =====================================================
    # OBJECTIVE / SUMMARY
    # Maximum: 10 points
    # =====================================================

    if categories["objectives"] > 0:
        score += 5

    if categories["summary"] > 0:
        score += 5

    # =====================================================
    # PERSONAL INFORMATION
    # Maximum: 10 points
    # =====================================================

    if categories["personal_information"] > 0:
        score += 10

    return min(score, 100)


def generate_summary(classified_sentences):

    """
    Generate a concise resume summary.

    Priority:
    1. Skills
    2. Experience
    3. Education
    4. Certification
    """

    important_categories = [
        "skills",
        "experience",
        "education",
        "certification"
    ]

    important_sentences = []

    for item in classified_sentences:

        category = item.get("category")

        sentence = item.get("sentence", "").strip()

        if (
            category in important_categories
            and sentence
        ):
            important_sentences.append(sentence)

    summary = " ".join(
        important_sentences
    )

    words = summary.split()

    if len(words) > 150:
        summary = " ".join(
            words[:150]
        )

    return summary
