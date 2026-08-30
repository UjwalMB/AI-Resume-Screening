import re
import spacy

# =========================================================
# LOAD SPACY MODEL
# =========================================================

nlp = spacy.load("en_core_web_sm")


# =========================================================
# REMOVE EMAIL
# =========================================================

def remove_email(text):

    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'

    return re.sub(
        pattern,
        "[EMAIL]",
        text
    )


# =========================================================
# REMOVE PHONE
# =========================================================

def remove_phone(text):

    pattern = r'(\+91[\s-]?)?[6-9]\d{9}'

    return re.sub(
        pattern,
        "[PHONE]",
        text
    )


# =========================================================
# REMOVE NAME / LOCATION
# =========================================================

def remove_names_and_locations(text):

    # -----------------------------------------------------
    # Protect technical skills before spaCy
    # -----------------------------------------------------

    protected_terms = [
        "Python",
        "JavaScript",
        "Java",
        "C",
        "C++",
        "SQL",
        "MySQL",
        "PostgreSQL",
        "MongoDB",
        "React",
        "ReactJS",
        "HTML",
        "CSS",
        "FastAPI",
        "Django",
        "Flask",
        "Node.js",
        "Express",
        "Git",
        "GitHub",
        "Docker",
        "Kubernetes",
        "AWS",
        "NLP",
        "Machine Learning",
        "Deep Learning",
        "SBERT",
        "NumPy",
        "Pandas",
        "TensorFlow",
        "PyTorch",
        "VS Code"
    ]

    placeholders = {}

    for index, term in enumerate(protected_terms):

        placeholder = f"__TECH_{index}__"

        pattern = r'\b' + re.escape(term) + r'\b'

        if re.search(pattern, text, flags=re.IGNORECASE):

            placeholders[placeholder] = term

            text = re.sub(
                pattern,
                placeholder,
                text,
                flags=re.IGNORECASE
            )

    # -----------------------------------------------------
    # Name phrases
    # -----------------------------------------------------

    text = re.sub(
        r'(?i)(\bmy name is\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'\1[NAME]',
        text
    )

    text = re.sub(
        r'(?i)(\bi am\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'\1[NAME]',
        text
    )

    text = re.sub(
        r'(?i)(\bthis is\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'\1[NAME]',
        text
    )

    # -----------------------------------------------------
    # spaCy entity detection
    # -----------------------------------------------------

    doc = nlp(text)

    cleaned_text = text

    for entity in reversed(doc.ents):

        if entity.label_ in ["PERSON", "GPE", "LOC"]:

            entity_text = entity.text.strip()

            # Never replace protected technical placeholders
            if entity_text.startswith("__TECH_"):
                continue

            # Avoid replacing very short technical words
            if entity_text.lower() in [
                "c",
                "java",
                "sql",
                "git",
                "react",
                "html",
                "css",
                "python"
            ]:
                continue

            replacement = (
                "[NAME]"
                if entity.label_ == "PERSON"
                else "[LOCATION]"
            )

            cleaned_text = (
                cleaned_text[:entity.start_char]
                + replacement
                + cleaned_text[entity.end_char:]
            )

    # -----------------------------------------------------
    # Restore technical skills
    # -----------------------------------------------------

    for placeholder, original in placeholders.items():

        cleaned_text = cleaned_text.replace(
            placeholder,
            original
        )

    return cleaned_text


# =========================================================
# COMPLETE PREPROCESSING
# =========================================================

def preprocess_text(text):

    text = remove_email(text)

    text = remove_phone(text)

    text = remove_names_and_locations(text)

    return text


# =========================================================
# SPLIT SENTENCES
# =========================================================

def split_into_sentences(text):

    doc = nlp(text)

    sentences = []

    for sentence in doc.sents:

        clean_sentence = sentence.text.strip()

        if clean_sentence:

            sentences.append(
                clean_sentence
            )

    return sentences


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    text = """
    My name is Ujwal.
    Email: ujwal@gmail.com
    Phone: +91 9876543210.

    I am a Computer Science Engineering student.

    Skills:
    Python,
    JavaScript,
    React,
    HTML,
    CSS,
    Git,
    MySQL,
    SBERT
    """

    print("----- ORIGINAL TEXT -----")
    print(text)

    cleaned_text = preprocess_text(text)

    print("\n----- CLEAN TEXT -----")
    print(cleaned_text)

    print("\n----- SENTENCES -----")

    sentences = split_into_sentences(
        cleaned_text
    )

    for i, sentence in enumerate(
        sentences,
        start=1
    ):

        print(
            f"{i}. {sentence}"
        )