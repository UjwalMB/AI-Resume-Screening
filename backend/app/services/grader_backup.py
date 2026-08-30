# =========================================================
# RESUME QUALITY SCORING
# =========================================================

def calculate_score(classified_sentences):

    categories = {
        "skills": 0,
        "experience": 0,
        "education": 0,
        "certification": 0,
        "summary": 0,
        "objectives": 0,
        "personal_information": 0
    }

    # -----------------------------------------------------
    # Count classified sentences
    # -----------------------------------------------------

    for item in classified_sentences:

        category = item.get("category")

        if category in categories:
            categories[category] += 1

    # -----------------------------------------------------
    # Resume quality score
    # -----------------------------------------------------

    score = 0

    # Skills
    if categories["skills"] > 0:
        score += 30

    # Experience / Projects
    if categories["experience"] > 0:
        score += 25

    # Education
    if categories["education"] > 0:
        score += 20

    # Certification
    if categories["certification"] > 0:
        score += 10

    # Career objective
    if categories["objectives"] > 0:
        score += 5

    # Summary
    if categories["summary"] > 0:
        score += 5

    # Personal information
    if categories["personal_information"] > 0:
        score += 5

    return min(score, 100)


# =========================================================
# GENERATE SUMMARY
# =========================================================

def generate_summary(classified_sentences):

    important_categories = [
        "skills",
        "experience",
        "education",
        "certification"
    ]

    important_sentences = []

    for item in classified_sentences:

        if item["category"] in important_categories:

            important_sentences.append(
                item["sentence"]
            )

    summary = " ".join(
        important_sentences
    )

    words = summary.split()

    if len(words) > 150:

        summary = " ".join(
            words[:150]
        )

    return summary