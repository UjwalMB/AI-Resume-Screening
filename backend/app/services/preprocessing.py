import re
import spacy

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")


# --------------------------------------------------
# Remove email addresses
# --------------------------------------------------
def remove_email(text):
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'

    return re.sub(pattern, "[EMAIL]", text)


# --------------------------------------------------
# Remove Indian phone numbers
# --------------------------------------------------
def remove_phone(text):
    pattern = r'(\+91[\s-]?)?[6-9]\d{9}'

    return re.sub(pattern, "[PHONE]", text)


# --------------------------------------------------
# Remove names and locations
# --------------------------------------------------
def remove_names_and_locations(text):

    # First handle phrases such as:
    # "My name is Ujwal"
    # "I am Ujwal"
    # "This is Ujwal"
    
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

    # Use spaCy for other names and locations
    doc = nlp(text)

    cleaned_text = text

    # Process entities from right to left
    for entity in reversed(doc.ents):

        if entity.label_ == "PERSON":
            cleaned_text = (
                cleaned_text[:entity.start_char]
                + "[NAME]"
                + cleaned_text[entity.end_char:]
            )

        elif entity.label_ in ["GPE", "LOC"]:
            cleaned_text = (
                cleaned_text[:entity.start_char]
                + "[LOCATION]"
                + cleaned_text[entity.end_char:]
            )

    return cleaned_text


# --------------------------------------------------
# Complete preprocessing
# --------------------------------------------------
def preprocess_text(text):

    text = remove_email(text)
    text = remove_phone(text)
    text = remove_names_and_locations(text)

    return text


# --------------------------------------------------
# Split into sentences
# --------------------------------------------------
def split_into_sentences(text):

    doc = nlp(text)

    sentences = []

    for sentence in doc.sents:

        clean_sentence = sentence.text.strip()

        if clean_sentence:
            sentences.append(clean_sentence)

    return sentences


# --------------------------------------------------
# Main program
# --------------------------------------------------
if __name__ == "__main__":

    text = """
    My name is Ujwal.
    Email: ujwal@gmail.com
    Phone: +91 9876543210

    I am a Computer Science Engineering student.
    Skills: Python, JavaScript, SQL
    """

    print("----- ORIGINAL TEXT -----")
    print(text)

    # Preprocess
    cleaned_text = preprocess_text(text)

    print("\n----- CLEAN TEXT -----")
    print(cleaned_text)

    # Split into sentences
    sentences = split_into_sentences(cleaned_text)

    print("\n----- SENTENCES -----")

    for i, sentence in enumerate(sentences, start=1):
        print(f"{i}. {sentence}")