from app.services.preprocessing import (
    preprocess_text,
    split_into_sentences
)


resume_text = """
My name is Ujwal.
Email: ujwal@example.com
Phone: 9876543210
I am a Computer Science Engineering student.
I have experience building web applications.
My skills include Python, JavaScript and SQL.
I completed a Python certification.
"""


clean_text = preprocess_text(resume_text)

sentences = split_into_sentences(clean_text)


print("----- CLEAN TEXT -----")
print(clean_text)

print("\n----- SENTENCES -----")

for index, sentence in enumerate(sentences, start=1):
    print(f"{index}. {sentence}")