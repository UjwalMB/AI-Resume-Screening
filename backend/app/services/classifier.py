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

    text = sentence.lower().strip()

    # =====================================================
    # 1. PERSONAL INFORMATION
    # =====================================================

    personal_keywords = [
        "email",
        "phone",
        "mobile",
        "linkedin",
        "github.com",
        "address",
        "[phone]",
        "[email]"
    ]

    if any(keyword in text for keyword in personal_keywords):
        return "personal_information"

    # =====================================================
    # 2. CERTIFICATION
    # =====================================================

    certification_keywords = [
        "certification",
        "certified",
        "certificate",
        "coursera",
        "udemy",
        "nptel",
        "aws certified",
        "google certified"
    ]

    if any(keyword in text for keyword in certification_keywords):
        return "certification"

    # =====================================================
    # 3. EXPERIENCE / PROJECT WORK
    # =====================================================

    experience_keywords = [
        "experience",
        "worked",
        "developed",
        "developed an",
        "developed a",
        "implemented",
        "built",
        "designed",
        "created",
        "engineered",
        "integrated",
        "collaborated",
        "contributed",
        "deployed",
        "maintained",
        "internship",
        "intern",
        "project",
        "academic project",
        "months",
        "years of experience",
        "responsible for",
        "using python",
        "using javascript",
        "using react",
        "using machine learning",
        "using sbert"
    ]

    if any(keyword in text for keyword in experience_keywords):
        return "experience"

    # =====================================================
    # 4. OBJECTIVES
    # =====================================================

    objective_keywords = [
        "career objective",
        "objective",
        "seeking",
        "looking for",
        "looking to",
        "entry-level role",
        "career goal",
        "aspire",
        "aim to"
    ]

    if any(keyword in text for keyword in objective_keywords):
        return "objectives"

    # =====================================================
    # 5. EDUCATION
    # =====================================================

    education_keywords = [
        "education",
        "b.e",
        "btech",
        "b.tech",
        "bachelor",
        "master",
        "m.tech",
        "mtech",
        "degree",
        "university",
        "college",
        "school",
        "cgpa",
        "gpa",
        "puc",
        "intermediate",
        "sslc",
        "12th",
        "10th",
        "percentage",
        "graduated",
        "engineering"
    ]

    if any(keyword in text for keyword in education_keywords):
        return "education"

    # =====================================================
    # 6. SKILLS
    # =====================================================

    skill_keywords = [
        "skills",
        "programming languages",
        "technical skills",
        "web technologies",
        "databases",
        "tools and platforms",
        "python",
        "javascript",
        "java",
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "react",
        "reactjs",
        "html",
        "css",
        "fastapi",
        "django",
        "flask",
        "node.js",
        "express",
        "git",
        "github",
        "docker",
        "kubernetes",
        "aws",
        "nlp",
        "machine learning",
        "deep learning",
        "sbert",
        "numpy",
        "pandas",
        "tensorflow",
        "pytorch",
        "vs code"
    ]

    if any(keyword in text for keyword in skill_keywords):
        return "skills"

    # =====================================================
    # 7. SUMMARY
    # =====================================================

    summary_keywords = [
        "summary",
        "professional summary",
        "profile",
        "professional profile"
    ]

    if any(keyword in text for keyword in summary_keywords):
        return "summary"

    # =====================================================
    # 8. DEFAULT
    # =====================================================

    return "summary"