import os
import joblib


# =========================================================
# MODEL PATH
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "resume_model.pkl"
)

VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "tfidf_vectorizer.pkl"
)


# =========================================================
# LOAD MODEL
# =========================================================

model = joblib.load(MODEL_PATH)

vectorizer = joblib.load(
    VECTORIZER_PATH
)


# =========================================================
# PREDICT RESUME
# =========================================================

def predict_resume(resume_text):

    vectorized_text = vectorizer.transform(
        [resume_text]
    )

    prediction = model.predict(
        vectorized_text
    )[0]

    probabilities = model.predict_proba(
        vectorized_text
    )[0]

    confidence = max(probabilities) * 100

    return {
        "prediction": prediction,
        "confidence": round(
            confidence,
            2
        )
    }