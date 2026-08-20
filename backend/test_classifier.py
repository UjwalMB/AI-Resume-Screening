from app.services.classifier import classify_sentence


sentences = [
    "I completed my B.E in Computer Science.",
    "I have experience building web applications.",
    "My skills include Python, JavaScript and SQL.",
    "I completed a Python certification.",
    "I am looking for a software developer position.",
    "Professional summary: Computer Science graduate with web development skills."
]


for sentence in sentences:

    category = classify_sentence(sentence)

    print(f"Sentence: {sentence}")
    print(f"Category: {category}")
    print("-------------------------")