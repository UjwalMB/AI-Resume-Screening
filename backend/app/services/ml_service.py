import os
import joblib


# =========================================================
# PROJECT ROOT
# =========================================================

BACKEND_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)


# =========================================================
# MODEL PATHS
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
# LOAD MODEL SAFELY
# =========================================================

model = None
vectorizer = None


print("\n==============================")
print("AI RESUME ML SERVICE")
print("==============================")
print("Model:", MODEL_PATH)
print("Vectorizer:", VECTORIZER_PATH)


# ---------------------------------------------------------
# Load vectorizer
# ---------------------------------------------------------

try:

    if os.path.exists(VECTORIZER_PATH):

        vectorizer = joblib.load(
            VECTORIZER_PATH
        )

        print("TF-IDF vectorizer loaded successfully.")

    else:

        print(
            "WARNING: TF-IDF vectorizer not found."
        )

except Exception as error:

    print(
        "WARNING: Could not load TF-IDF vectorizer:",
        error
    )

    vectorizer = None


# ---------------------------------------------------------
# Load ML model
# ---------------------------------------------------------

try:

    if os.path.exists(MODEL_PATH):

        model = joblib.load(
            MODEL_PATH
        )

        print("Resume ML model loaded successfully.")

    else:

        print(
            "WARNING: Resume ML model not found."
        )

except Exception as error:

    print(
        "WARNING: Could not load resume ML model:",
        error
    )

    model = None


print("==============================")
print("ML SERVICE READY")
print("==============================\n")


# =========================================================
# PREDICT RESUME
# =========================================================

def predict_resume(resume_text):

    """
    Predict whether a resume should be shortlisted.

    The ML model is optional. If the saved model is
    incompatible or unavailable, the application returns
    REVIEW instead of crashing the complete upload process.
    """

    # -----------------------------------------------------
    # Empty resume
    # -----------------------------------------------------

    if not resume_text:

        return {
            "prediction": "REVIEW",
            "confidence": 0.0
        }


    # -----------------------------------------------------
    # Model unavailable
    # -----------------------------------------------------

    if model is None or vectorizer is None:

        print(
            "ML model unavailable. Returning REVIEW."
        )

        return {
            "prediction": "REVIEW",
            "confidence": 0.0
        }


    # -----------------------------------------------------
    # TF-IDF transformation
    # -----------------------------------------------------

    try:

        vectorized_text = vectorizer.transform(
            [resume_text]
        )

    except Exception as error:

        print(
            "TF-IDF transformation error:",
            error
        )

        return {
            "prediction": "REVIEW",
            "confidence": 0.0
        }


    # -----------------------------------------------------
    # Prediction
    # -----------------------------------------------------

    try:

        prediction = model.predict(
            vectorized_text
        )[0]

    except Exception as error:

        print(
            "ML prediction error:",
            error
        )

        return {
            "prediction": "REVIEW",
            "confidence": 0.0
        }


    # -----------------------------------------------------
    # Confidence
    # -----------------------------------------------------

    confidence = 0.0

    try:

        if hasattr(model, "predict_proba"):

            probabilities = model.predict_proba(
                vectorized_text
            )[0]

            confidence = (
                max(probabilities) * 100
            )

    except Exception as error:

        print(
            "Confidence calculation error:",
            error
        )


    # -----------------------------------------------------
    # Normalize prediction
    # -----------------------------------------------------

    prediction_text = str(
        prediction
    ).upper().strip()


    # -----------------------------------------------------
    # Return
    # -----------------------------------------------------

    return {

        "prediction":
            prediction_text,

        "confidence":
            round(
                float(confidence),
                2
            )

    }