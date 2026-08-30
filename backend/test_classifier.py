from app.services.parser import extract_text_from_pdf
from app.services.preprocessing import (
    preprocess_text,
    split_into_sentences
)
from app.services.classifier import classify_sentence


file_path = "uploads/961af37d_final resume.pdf"


# Extract PDF text
raw_text = extract_text_from_pdf(file_path)


# Preprocess
clean_text = preprocess_text(raw_text)


# Split sentences
sentences = split_into_sentences(clean_text)


print("\n==============================")
print("CLASSIFIER TEST")
print("==============================")


for sentence in sentences:

    category = classify_sentence(sentence)

    print("\nCATEGORY:", category)
    print("TEXT:", sentence)


print("\n==============================")
print("TOTAL SENTENCES:", len(sentences))
print("==============================")
