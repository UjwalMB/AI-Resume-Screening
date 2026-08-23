import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "resume_dataset.csv")

df = pd.read_csv(
    DATASET_PATH,
    dtype={"resume_text": str, "label": str}
)

df["resume_text"] = df["resume_text"].fillna("").str.strip()
df["label"] = df["label"].fillna("").str.strip().str.upper()

df = df[df["resume_text"] != ""]
df = df[df["label"].isin(["SHORTLIST", "REJECT"])]
df = df.drop_duplicates(subset=["resume_text"])
df = df.reset_index(drop=True)

df["resume_text"] = df["resume_text"].astype(str)
df["label"] = df["label"].astype(str)

lines = ["resume_text,label"]

for text, label in zip(df["resume_text"], df["label"]):
    escaped = str(text).replace('"', '""')
    lines.append(f'"{escaped}",{label}')

with open(DATASET_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print("Dataset cleaned and saved:", DATASET_PATH)
print("Rows:", len(df))
print("\nLabel distribution:")
print(df["label"].value_counts())
print("\nDtypes:")
print(df.dtypes)

check = pd.read_csv(DATASET_PATH, dtype={"resume_text": str})
assert check["resume_text"].map(type).eq(str).all(), "Non-string resume_text found"
print("\nVerified: every resume_text is a string")
