from app.services.preprocessing import preprocess_text


resume_text = """
My name is Ujwal.
Email: ujwal@example.com
Phone: 9876543210

I am a Computer Science Engineering student.
Skills: Python, JavaScript, SQL
"""

clean_text = preprocess_text(resume_text)

print("----- ORIGINAL TEXT -----")
print(resume_text)

print("----- CLEAN TEXT -----")
print(clean_text)