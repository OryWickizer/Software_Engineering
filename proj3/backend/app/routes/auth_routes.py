from fastapi import APIRouter, HTTPException, status
from fastapi.responses import HTMLResponse
from datetime import datetime, timedelta


from ..models import (
    UserCreate,
    UserLogin,
    UserRole,
    AccountStatus,
    UserStats,
    SocialMediaLinks,
    DietaryPreferences,
)
from ..database import get_database
from ..utils import (
    hash_password,
    verify_password,
    generate_verification_token,
    send_verification_email,
)

router = APIRouter()


# User Registration
@router.post(
    "/api/auth/register/user", response_model=dict, status_code=status.HTTP_201_CREATED
)
async def register_user(user: UserCreate):
    """Register a new user account"""
    db = get_database()
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already associated with an account",
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user document
    user_doc = {
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name,
        "phone": user.phone,
        "location": user.location.dict(),
        "bio": user.bio,
        "profile_picture": user.profile_picture,
        "dietary_preferences": DietaryPreferences().dict(),
        "social_media": SocialMediaLinks().dict(),
        "role": UserRole.USER,
        "status": AccountStatus.ACTIVE,
        "stats": UserStats().dict(),
        "verified": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    # Insert user
    result = await db.users.insert_one(user_doc)

    return {
        "message": "User account created successfully. You can now log in.",
        "user_id": str(result.inserted_id),
        "email": user.email,
    }


@router.get("/api/auth/verify", response_model=dict)
async def verify_user(email: str, token: str):
    """Verify a user's email address (GET).

    This endpoint returns an HTML page so users who click the emailed link
    get a human-friendly confirmation instead of raw JSON.
    """
    db = get_database()

    token_doc = await db.verification_tokens.find_one(
        {"email": email, "token": token, "token_type": "email_verification"}
    )

    if not token_doc:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification token."
        )

    if datetime.utcnow() > token_doc["expires_at"]:
        raise HTTPException(status_code=400, detail="Verification token has expired.")

    # Mark user verified and remove token
    await db.users.update_one(
        {"email": email}, {"$set": {"verified": True, "status": AccountStatus.ACTIVE}}
    )

    await db.verification_tokens.delete_one({"_id": token_doc["_id"]})

    html = f"""
    <html>
      <head><title>Email Verified</title></head>
      <body style="font-family:system-ui, -apple-system,
        'Segoe UI', Roboto, Helvetica, Arial; padding:2rem;">
        <h2>Email verified successfully!</h2>
        <p>Your email <strong>{email}</strong> has been verified. You can now log in.</p>
      </body>
    </html>
    """
    return HTMLResponse(content=html, status_code=status.HTTP_200_OK)


# Email Verification
@router.post("/api/auth/verify", response_model=dict)
async def verify_email(email: str, token: str, account_type: str = "user"):
    """Verify user email"""
    db = get_database()
    # Find verification token
    token_doc = await db.verification_tokens.find_one(
        {"email": email, "token": token, "token_type": "email_verification"}
    )

    if not token_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    # Check if token is expired
    if token_doc["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired",
        )

    # Update user/restaurant as verified
    collection = db.users
    email_field = "email"

    result = await collection.update_one(
        {email_field: email},
        {
            "$set": {
                "verified": True,
                "status": (
                    AccountStatus.ACTIVE
                    if account_type == "user"
                    else AccountStatus.PENDING
                ),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    # Delete used token
    await db.verification_tokens.delete_one({"_id": token_doc["_id"]})

    message = "Email verified successfully! Your account is now active."
    return {"message": message, "verified": True}


# Resend Verification Email
@router.post("/api/auth/resend-verification", response_model=dict)
async def resend_verification(email: str, account_type: str = "user"):
    """Resend verification email"""
    db = get_database()
    # Find user
    collection = db.users
    email_field = "email"

    account = await collection.find_one({email_field: email})
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    if account.get("verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is already verified",
        )

    # Delete old tokens
    await db.verification_tokens.delete_many(
        {"email": email, "token_type": "email_verification"}
    )

    # Generate new token
    token = generate_verification_token()
    token_doc = {
        "email": email,
        "token": token,
        "token_type": "email_verification",
        "expires_at": datetime.utcnow() + timedelta(hours=24),
        "created_at": datetime.utcnow(),
    }
    await db.verification_tokens.insert_one(token_doc)

    # Send verification email
    send_verification_email(email, token, account_type)

    return {"message": "Verification email sent successfully"}


# Login
@router.post("/api/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    """Login for users"""
    db = get_database()
    # Check in users collection
    user = await db.users.find_one({"email": credentials.email})
    if user:
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        if not user.get("verified"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in",
            )

        return {
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "full_name": user["full_name"],
        }

    # User not found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )


@router.get("/api/debug/users")
async def list_users():
    db = get_database()
    users = await db.users.find().to_list(100)

    for user in users:
        user["_id"] = str(user["_id"])

    return users
