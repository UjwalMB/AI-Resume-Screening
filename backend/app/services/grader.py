def calculate_score(classified_sentences):
    score = 0

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
        category = item["category"]

        if category in categories:
            categories[category] += 1

    # Skills: maximum 35 points
    score += min(categories["skills"] * 7, 35)

    # Experience: maximum 30 points
    score += min(categories["experience"] * 6, 30)

    # Education: maximum 20 points
    score += min(categories["education"] * 10, 20)

    # Certifications: maximum 10 points
    score += min(categories["certification"] * 5, 10)

    # Summary: maximum 5 points
    if categories["summary"] > 0:
        score += 5

    return min(score, 100)


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
            important_sentences.append(item["sentence"])

    summary = " ".join(important_sentences)

    words = summary.split()

    if len(words) > 150:
        summary = " ".join(words[:150])

    return summary