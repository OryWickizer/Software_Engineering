from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from .database import get_database

security = HTTPBearer()
# Optional bearer that does not raise if header is missing (useful for upload endpoints)
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependency to get the current authenticated user from token.
    For now, this is a simple implementation. You'll want to add JWT later.
    """
    db = get_database()

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    # Simple token validation (replace with JWT in production)
    try:
        # Extract token (assuming "Bearer <email>" format temporarily)
        token = credentials.credentials
        print(f"[auth] token received: {repr(token)}")
        user = await db.users.find_one({"email": token})

        # Debugging: print retrieved user summary
        if user:
            print(
                f"[auth] found user: _id={user.get('_id')} email={user.get('email')}"
                f" verified={user.get('verified')}"
            )
        else:
            print(f"[auth] no user found for token: {repr(token)}")

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        # Accept truthy values for verified (bool True or string 'true')
        verified_val = user.get("verified")
        is_verified = False
        if isinstance(verified_val, bool):
            is_verified = verified_val
        elif isinstance(verified_val, str):
            is_verified = verified_val.lower() in ("true", "1", "yes")

        if not is_verified:
            print(
                f"[auth] user present but not verified according to DB value: {repr(verified_val)}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified"
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth] unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_optional),
) -> Optional[dict]:
    """Return the current user if provided and valid, otherwise None.

    This allows endpoints to accept uploads from anonymous users during development.
    It will not raise if the Authorization header is missing or invalid.
    """
    db = get_database()
    if not credentials:
        return None

    try:
        token = credentials.credentials
        user = await db.users.find_one({"email": token})
        # Accept truthy values for verified similar to get_current_user
        if not user:
            return None
        verified_val = user.get("verified")
        is_verified = False
        if isinstance(verified_val, bool):
            is_verified = verified_val
        elif isinstance(verified_val, str):
            is_verified = verified_val.lower() in ("true", "1", "yes")

        if not is_verified:
            return None
        return user
    except Exception:
        return None
