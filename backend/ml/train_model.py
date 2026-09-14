import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

import matplotlib.pyplot as plt


# =========================================================
# FILE PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "resume_dataset.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "resume_model.pkl"
)

VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "tfidf_vectorizer.pkl"
)

CONFUSION_MATRIX_PATH = os.path.join(
    BASE_DIR,
    "confusion_matrix.png"
)


# =========================================================
# 1. LOAD DATASET
# =========================================================

print("\n==============================")
print("LOADING DATASET")
print("==============================")

print("Dataset:", DATASET_PATH)

df = pd.read_csv(DATASET_PATH)

print("\nDataset shape:")
print(df.shape)

print("\nClass distribution:")
print(df["label"].value_counts())


# =========================================================
# 2. REMOVE EMPTY VALUES
# =========================================================

df = df.dropna(
    subset=[
        "resume_text",
        "label"
    ]
)

print("\nRows after removing empty values:")
print(len(df))


# =========================================================
# 3. INPUT AND OUTPUT
# =========================================================

X = df["resume_text"]

y = df["label"]


# =========================================================
# 4. SPLIT DATA
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\n==============================")
print("TRAIN / TEST")
print("==============================")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# =========================================================
# 5. TF-IDF VECTORIZER
# =========================================================

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    max_features=5000,
    ngram_range=(1, 1)
)

X_train_tfidf = vectorizer.fit_transform(
    X_train
)

X_test_tfidf = vectorizer.transform(
    X_test
)

print("\n==============================")
print("TF-IDF")
print("==============================")

print(
    "Training TF-IDF shape:",
    X_train_tfidf.shape
)

print(
    "Vocabulary size:",
    len(vectorizer.vocabulary_)
)


# =========================================================
# 6. CREATE ML MODEL
# =========================================================

model = LogisticRegression(
    max_iter=1000
)


# =========================================================
# 7. TRAIN MODEL
# =========================================================

print("\n==============================")
print("TRAINING MODEL")
print("==============================")

print("Training model...")

model.fit(
    X_train_tfidf,
    y_train
)

print("Model training completed!")


# =========================================================
# 8. MAKE PREDICTIONS
# =========================================================

predictions = model.predict(
    X_test_tfidf
)


# =========================================================
# 9. EVALUATE MODEL
# =========================================================

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

recall = recall_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

f1 = f1_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)


# =========================================================
# 10. DISPLAY RESULTS
# =========================================================

print("\n==============================")
print("ML MODEL RESULTS")
print("==============================")

print(
    f"Accuracy  : {accuracy:.4f}"
)

print(
    f"Precision : {precision:.4f}"
)

print(
    f"Recall    : {recall:.4f}"
)

print(
    f"F1 Score  : {f1:.4f}"
)


print("\n==============================")
print("CLASSIFICATION REPORT")
print("==============================")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# =========================================================
# 11. CONFUSION MATRIX
# =========================================================

cm = confusion_matrix(
    y_test,
    predictions,
    labels=model.classes_
)

display = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=model.classes_
)

display.plot()

plt.title(
    "Resume Screening ML Model - Confusion Matrix"
)

plt.tight_layout()

plt.savefig(
    CONFUSION_MATRIX_PATH,
    dpi=300
)

plt.close()

print("\nConfusion matrix saved:")
print(CONFUSION_MATRIX_PATH)


# =========================================================
# 12. SAVE MODEL
# =========================================================

joblib.dump(
    model,
    MODEL_PATH
)

print("\nML model saved:")
print(MODEL_PATH)


# =========================================================
# 13. SAVE TF-IDF VECTORIZER
# =========================================================

joblib.dump(
    vectorizer,
    VECTORIZER_PATH
)

print("\nTF-IDF vectorizer saved:")
print(VECTORIZER_PATH)


# =========================================================
# 14. VERIFY SAVED MODEL
# =========================================================

print("\n==============================")
print("VERIFYING SAVED MODEL")
print("==============================")

loaded_model = joblib.load(
    MODEL_PATH
)

loaded_vectorizer = joblib.load(
    VECTORIZER_PATH
)

print(
    "Model type:",
    type(loaded_model)
)

print(
    "Model classes:",
    loaded_model.classes_
)

print(
    "Has predict:",
    hasattr(loaded_model, "predict")
)

print(
    "Has predict_proba:",
    hasattr(loaded_model, "predict_proba")
)

print(
    "Vectorizer vocabulary:",
    len(loaded_vectorizer.vocabulary_)
)


# =========================================================
# 15. TEST PREDICTION
# =========================================================

test_resume = """
Python FastAPI SQL pandas NumPy machine learning
React JavaScript Git Docker backend development
"""

test_vector = loaded_vectorizer.transform(
    [test_resume]
)

test_prediction = loaded_model.predict(
    test_vector
)[0]

test_probabilities = loaded_model.predict_proba(
    test_vector
)[0]

test_confidence = max(
    test_probabilities
) * 100


print("\n==============================")
print("TEST PREDICTION")
print("==============================")

print(
    "Prediction:",
    test_prediction
)

print(
    "Confidence:",
    f"{test_confidence:.2f}%"
)


# =========================================================
# 16. TRAINING COMPLETE
# =========================================================

print("\n==============================")
print("TRAINING COMPLETE")
print("==============================")

print("Dataset:")
print(DATASET_PATH)

print("\nModel:")
print(MODEL_PATH)

print("\nVectorizer:")
print(VECTORIZER_PATH)

print("\nConfusion Matrix:")
print(CONFUSION_MATRIX_PATH)

print("\nML system is ready.")