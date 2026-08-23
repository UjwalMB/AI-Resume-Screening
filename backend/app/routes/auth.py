from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import bcrypt

from app.auth import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    AUTH_TOKEN
)

from app.database import get_connection


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REQUEST MODELS
# =========================================================

class LoginRequest(BaseModel):

    username: str

    password: str


class SignupRequest(BaseModel):

    username: str

    password: str


# =========================================================
# SIGNUP
# =========================================================

@router.post("/signup")
def signup(
    request: SignupRequest
):

    # -----------------------------------------------------
    # VALIDATE INPUT
    # -----------------------------------------------------

    if not request.username.strip():

        raise HTTPException(
            status_code=400,
            detail="Username is required"
        )

    if len(request.password) < 4:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 4 characters"
        )


    # -----------------------------------------------------
    # CHECK IF USERNAME ALREADY EXISTS
    # -----------------------------------------------------

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT id FROM users
                WHERE username = %s
                """,
                (request.username.strip(),)
            )

            existing_user = cursor.fetchone()

            if existing_user:

                raise HTTPException(
                    status_code=409,
                    detail="Username already exists"
                )


            # -------------------------------------------------
            # HASH PASSWORD
            # -------------------------------------------------

            password_hash = bcrypt.hashpw(
                request.password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")


            # -------------------------------------------------
            # INSERT USER
            # -------------------------------------------------

            cursor.execute(
                """
                INSERT INTO users (
                    username,
                    password_hash
                )
                VALUES (%s, %s)
                RETURNING id
                """,
                (
                    request.username.strip(),
                    password_hash
                )
            )

            user_id = cursor.fetchone()[0]

        connection.commit()


        # -----------------------------------------------------
        # SIGNUP SUCCESS
        # -----------------------------------------------------

        return {

            "authenticated": True,

            "username": request.username.strip(),

            "token": AUTH_TOKEN

        }

    finally:

        connection.close()


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    request: LoginRequest
):

    # -----------------------------------------------------
    # CHECK ADMIN CREDENTIALS (env-based fallback)
    # -----------------------------------------------------

    if (
        request.username == ADMIN_USERNAME
        and request.password == ADMIN_PASSWORD
    ):

        return {

            "authenticated": True,

            "username": ADMIN_USERNAME,

            "token": AUTH_TOKEN

        }


    # -----------------------------------------------------
    # CHECK DATABASE USERS
    # -----------------------------------------------------

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT id, username, password_hash
                FROM users
                WHERE username = %s
                """,
                (request.username,)
            )

            user = cursor.fetchone()


        # -------------------------------------------------
        # USER NOT FOUND
        # -------------------------------------------------

        if not user:

            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )


        # -------------------------------------------------
        # VERIFY PASSWORD
        # -------------------------------------------------

        password_valid = bcrypt.checkpw(
            request.password.encode("utf-8"),
            user[2].encode("utf-8")
        )

        if not password_valid:

            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )


        # -------------------------------------------------
        # LOGIN SUCCESS
        # -------------------------------------------------

        return {

            "authenticated": True,

            "username": user[1],

            "token": AUTH_TOKEN

        }

    finally:

        connection.close()