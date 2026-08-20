from fastapi import Header, HTTPException


def require_authentication(
    authorization: str | None = Header(default=None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if authorization != "Bearer admin-token":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    return True