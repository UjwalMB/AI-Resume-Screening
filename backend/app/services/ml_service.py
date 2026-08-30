import os
import joblib


# =========================================================
# PROJECT ROOT
# =========================================================

# __file__:
# backend/app/services/ml_service.py
#
# Go up:
# services -> app -> backend
#

BACKEND_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)


# =========================================================
# MODEL PATH
# =========================================================

MODEL_PATH = os.path.join(
    BACKEND_DIR,
    "ml",
    "resume_model.pkl"
)

VECTORIZER_PATH = os.path.join(
    BACKEND_DIR,
    "ml",
    "tfidf_vectorizer.pkl"
)


# =========================================================
# DEBUG PATHS
# =========================================================

print("\n==============================")
print("ML MODEL")
print("==============================")

print(
    "Model:",
    MODEL_PATH
)

print(
    "Vectorizer:",
    VECTORIZER_PATH
)


# =========================================================
# CHECK FILES
# =========================================================

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"ML model not found: {MODEL_PATH}"
    )


if not os.path.exists(VECTORIZER_PATH):

    raise FileNotFoundError(
        f"TF-IDF vectorizer not found: {VECTORIZER_PATH}"
    )


# =========================================================
# LOAD MODEL
# =========================================================

print("Loading ML model...")

model = joblib.load(
    MODEL_PATH
)

vectorizer = joblib.load(
    VECTORIZER_PATH
)

print(
    "ML model loaded successfully."
)


# =========================================================
# PREDICT RESUME
# =========================================================

def predict_resume(resume_text):

    if not resume_text:

        return {
            "prediction": "REVIEW",
            "confidence": 0.0
        }


    # -----------------------------------------------------
    # TF-IDF
    # -----------------------------------------------------

    vectorized_text = vectorizer.transform(
        [resume_text]
    )


    # -----------------------------------------------------
    # PREDICTION
    # -----------------------------------------------------

    prediction = model.predict(
        vectorized_text
    )[0]


    # -----------------------------------------------------
    # CONFIDENCE
    # -----------------------------------------------------

    confidence = 0.0

    try:

        probabilities = model.predict_proba(
            vectorized_text
        )[0]

        confidence = (
            max(probabilities)
            * 100
        )

    except Exception as error:

        print(
            "Confidence calculation error:",
            error
        )


    # -----------------------------------------------------
    # RETURN
    # -----------------------------------------------------

    return {

        "prediction":
            str(prediction).upper(),

        "confidence":
            round(
                float(confidence),
                2
            )

    }