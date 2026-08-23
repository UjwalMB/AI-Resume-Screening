from fastapi import Header, HTTPException
import os


# =========================================================
# LOGIN CREDENTIALS
# =========================================================

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")

AUTH_TOKEN = os.getenv("AUTH_TOKEN", "admin-token")


# =========================================================
# REQUIRE AUTHENTICATION
# =========================================================

def require_authentication(
    authorization: str | None = Header(default=None)
):
    """
    Protect API endpoints.

    Expected header:

    Authorization: Bearer admin-token
    """

    # -----------------------------------------------------
    # NO TOKEN
    # -----------------------------------------------------

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )


    # -----------------------------------------------------
    # INVALID TOKEN
    # -----------------------------------------------------

    if authorization != f"Bearer {AUTH_TOKEN}":

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


    # -----------------------------------------------------
    # AUTHENTICATED
    # -----------------------------------------------------

    return True