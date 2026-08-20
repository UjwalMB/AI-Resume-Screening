from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(data: LoginRequest):

    correct_username = "admin"
    correct_password = "admin123"

    if (
        data.username != correct_username
        or data.password != correct_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return {
        "message": "Login successful",
        "username": data.username,
        "authenticated": True,
        "token": "admin-token"
    }