from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    AUTH_TOKEN
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# LOGIN REQUEST
# =========================================================

class LoginRequest(BaseModel):

    username: str

    password: str


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    request: LoginRequest
):

    # -----------------------------------------------------
    # CHECK USERNAME
    # -----------------------------------------------------

    if request.username != ADMIN_USERNAME:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # -----------------------------------------------------
    # CHECK PASSWORD
    # -----------------------------------------------------

    if request.password != ADMIN_PASSWORD:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # -----------------------------------------------------
    # LOGIN SUCCESS
    # -----------------------------------------------------

    return {

        "authenticated": True,

        "username": ADMIN_USERNAME,

        "token": AUTH_TOKEN

    }