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
    confusion_matrix
)


# =========================================================
# STEP 1: LOAD DATASET
# =========================================================

print("\n======================================")
print("       LOADING DATASET")
print("======================================")

df = pd.read_csv("resume_dataset.csv")

print("\nDataset loaded successfully.")
print("Total rows:", len(df))


# =========================================================
# STEP 2: CHECK REQUIRED COLUMNS
# =========================================================

required_columns = [
    "resume_text",
    "label"
]

for column in required_columns:

    if column not in df.columns:

        raise ValueError(
            f"Missing required column: {column}"
        )


print("\nRequired columns found.")


# =========================================================
# STEP 3: REMOVE EMPTY VALUES
# =========================================================

df = df.dropna(
    subset=[
        "resume_text",
        "label"
    ]
)

print(
    "Rows after removing empty values:",
    len(df)
)


# =========================================================
# STEP 4: REMOVE DUPLICATE RESUMES
# =========================================================

df = df.drop_duplicates(
    subset=["resume_text"]
)

print(
    "Rows after removing duplicates:",
    len(df)
)


# =========================================================
# STEP 5: DISPLAY LABEL DISTRIBUTION
# =========================================================

print("\n======================================")
print("       LABEL DISTRIBUTION")
print("======================================")

print(
    df["label"].value_counts()
)


# =========================================================
# STEP 6: INPUT + TARGET
# =========================================================

X = df["resume_text"].astype(str)

y = df["label"].astype(str)


# =========================================================
# STEP 7: TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.2,

    random_state=42,

    stratify=y
)


print("\n======================================")
print("       DATASET SPLIT")
print("======================================")

print(
    "Training samples:",
    len(X_train)
)

print(
    "Testing samples:",
    len(X_test)
)


# =========================================================
# STEP 8: TF-IDF VECTORIZATION
# =========================================================

print("\n======================================")
print("       TF-IDF VECTORIZATION")
print("======================================")

vectorizer = TfidfVectorizer(

    max_features=5000,

    stop_words="english"
)


# Fit only on training data

X_train_vectorized = vectorizer.fit_transform(
    X_train
)


# Transform testing data

X_test_vectorized = vectorizer.transform(
    X_test
)


print(
    "Training matrix shape:",
    X_train_vectorized.shape
)

print(
    "Testing matrix shape:",
    X_test_vectorized.shape
)


# =========================================================
# STEP 9: TRAIN MACHINE LEARNING MODEL
# =========================================================

print("\n======================================")
print("       TRAINING ML MODEL")
print("======================================")

model = LogisticRegression(
    max_iter=1000
)


model.fit(

    X_train_vectorized,

    y_train

)


print(
    "\nModel training completed successfully."
)


# =========================================================
# STEP 10: MAKE PREDICTIONS
# =========================================================

print("\n======================================")
print("       MAKING PREDICTIONS")
print("======================================")

y_pred = model.predict(
    X_test_vectorized
)


print(
    "Predictions generated successfully."
)


# =========================================================
# STEP 11: CALCULATE METRICS
# =========================================================

accuracy = accuracy_score(

    y_test,

    y_pred

)


precision = precision_score(

    y_test,

    y_pred,

    average="weighted",

    zero_division=0

)


recall = recall_score(

    y_test,

    y_pred,

    average="weighted",

    zero_division=0

)


f1 = f1_score(

    y_test,

    y_pred,

    average="weighted",

    zero_division=0

)


# =========================================================
# STEP 12: DISPLAY MODEL PERFORMANCE
# =========================================================

print("\n======================================")
print("       ML MODEL EVALUATION")
print("======================================")


print(
    f"\nAccuracy  : {accuracy * 100:.2f}%"
)


print(
    f"Precision : {precision * 100:.2f}%"
)


print(
    f"Recall    : {recall * 100:.2f}%"
)


print(
    f"F1-Score  : {f1 * 100:.2f}%"
)


# =========================================================
# STEP 13: CLASSIFICATION REPORT
# =========================================================

print("\n======================================")
print("       CLASSIFICATION REPORT")
print("======================================")


print(

    classification_report(

        y_test,

        y_pred,

        zero_division=0

    )

)


# =========================================================
# STEP 14: CONFUSION MATRIX
# =========================================================

print("\n======================================")
print("       CONFUSION MATRIX")
print("======================================")


cm = confusion_matrix(

    y_test,

    y_pred

)


print(cm)


# =========================================================
# STEP 15: SAVE ML MODEL
# =========================================================

print("\n======================================")
print("       SAVING ML MODEL")
print("======================================")


joblib.dump(

    model,

    "resume_model.pkl"

)


print(
    "Saved: resume_model.pkl"
)


# =========================================================
# STEP 16: SAVE TF-IDF VECTORIZER
# =========================================================

joblib.dump(

    vectorizer,

    "tfidf_vectorizer.pkl"

)


print(
    "Saved: tfidf_vectorizer.pkl"
)


# =========================================================
# STEP 17: FINAL MESSAGE
# =========================================================

print("\n======================================")
print("       TRAINING COMPLETED")
print("======================================")


print(
    "\nYour ML model is ready."
)

print(
    "Model file     : resume_model.pkl"
)

print(
    "Vectorizer file: tfidf_vectorizer.pkl"
)

print(
    "\nYou can now use these files"
)

print(
    "inside your ML prediction service."
)

print("\n======================================\n")