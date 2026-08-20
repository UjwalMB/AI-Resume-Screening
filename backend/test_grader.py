from app.services.grader import (
    calculate_score,
    generate_summary
)


classified_sentences = [
    {
        "sentence": "I completed my B.E in Computer Science.",
        "category": "education"
    },
    {
        "sentence": "I have experience building web applications.",
        "category": "experience"
    },
    {
        "sentence": "I worked on a Python project.",
        "category": "experience"
    },
    {
        "sentence": "My skills include Python, JavaScript and SQL.",
        "category": "skills"
    },
    {
        "sentence": "I completed a Python certification.",
        "category": "certification"
    }
]


score = calculate_score(classified_sentences)

summary = generate_summary(classified_sentences)


print("----- SCORE -----")
print(score)


print("\n----- SUMMARY -----")
print(summary)