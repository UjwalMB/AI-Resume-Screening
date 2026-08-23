from fastapi import APIRouter
import json
import os


router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)


# =========================================================
# ML METRICS FILE
# =========================================================

METRICS_FILE = os.path.join(
    os.path.dirname(__file__),
    "../../ml/model_metrics.json"
)


# =========================================================
# GET ML MODEL METRICS
# =========================================================

@router.get("/metrics")
def get_ml_metrics():

    try:

        with open(
            METRICS_FILE,
            "r"
        ) as file:

            metrics = json.load(file)


        return {

            "accuracy":
                metrics.get("accuracy", 0),

            "precision":
                metrics.get("precision", 0),

            "recall":
                metrics.get("recall", 0),

            "f1_score":
                metrics.get("f1_score", 0)

        }

    except FileNotFoundError:

        return {

            "accuracy": 0,

            "precision": 0,

            "recall": 0,

            "f1_score": 0

        }