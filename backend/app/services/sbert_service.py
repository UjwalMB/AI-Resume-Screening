from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# LOAD SBERT MODEL ONCE
# =========================================================

model = SentenceTransformer("all-MiniLM-L6-v2")


# =========================================================
# CREATE EMBEDDING
# =========================================================

def get_embedding(text):
    """
    Convert text into an SBERT embedding.
    """

    if not text:
        text = ""

    return model.encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )


# =========================================================
# CALCULATE SIMILARITY
# =========================================================

def calculate_similarity(
    resume_embedding,
    job_embedding
):
    """
    Calculate cosine similarity between
    two already-created embeddings.
    """

    similarity = cosine_similarity(
        [resume_embedding],
        [job_embedding]
    )[0][0]

    return round(
        float(similarity * 100),
        2
    )