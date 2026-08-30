CATEGORIES = [
    "personal_information",
    "education",
    "experience",
    "skills",
    "certification",
    "summary",
    "objectives"
]


def classify_sentence(sentence):

    text = sentence.lower()

    if any(word in text for word in [
        "email",
        "phone",
        "mobile",
        "address"
    ]):
        return "personal_information"

    if any(word in text for word in [
        "b.e",
        "btech",
        "b.tech",
        "degree",
        "bachelor",
        "master",
        "m.tech",
        "education",
        "university",
        "college"
    ]):
        return "education"

    if any(word in text for word in [
        "experience",
        "worked",
        "developed",
        "internship",
        "intern",
        "company",
        "years of experience"
    ]):
        return "experience"

    if any(word in text for word in [
        "skills",
        "python",
        "javascript",
        "java",
        "sql",
        "react",
        "fastapi",
        "django",
        "html",
        "css"
    ]):
        return "skills"

    if any(word in text for word in [
        "certification",
        "certified",
        "certificate",
        "coursera",
        "udemy"
    ]):
        return "certification"

    if any(word in text for word in [
        "objective",
        "career objective",
        "looking for",
        "seeking"
    ]):
        return "objectives"

    if any(word in text for word in [
        "summary",
        "professional summary",
        "profile"
    ]):
        return "summary"

    return "summary"