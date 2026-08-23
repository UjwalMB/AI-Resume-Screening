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
    classification_report
)
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay


# =========================================================
# 1. LOAD DATASET
# =========================================================

df = pd.read_csv("dataset.csv")

print("\n==============================")
print("DATASET")
print("==============================")

print(df)

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

    ngram_range=(1, 2)
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


# =========================================================
# 6. CREATE ML MODEL
# =========================================================

model = LogisticRegression(
    max_iter=1000
)


# =========================================================
# 7. TRAIN MODEL
# =========================================================

print("\nTraining model...")

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
# CONFUSION MATRIX
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

plt.title("Resume Screening ML Model - Confusion Matrix")

plt.tight_layout()

plt.savefig(
    "confusion_matrix.png",
    dpi=300
)

plt.show()

print("\nConfusion matrix saved:")
print("confusion_matrix.png")

# =========================================================
# 11. SAVE MODEL
# =========================================================

joblib.dump(
    model,
    "resume_model.pkl"
)


print("\nML model saved:")
print("resume_model.pkl")


# =========================================================
# 12. SAVE TF-IDF VECTORIZER
# =========================================================

joblib.dump(
    vectorizer,
    "tfidf_vectorizer.pkl"
)


print("\nTF-IDF vectorizer saved:")
print("tfidf_vectorizer.pkl")


print("\n==============================")
print("TRAINING COMPLETE")
print("==============================")