from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from ..models import (
    UserUpdate,
    UserResponse,
    DietaryPreferences,
    SocialMediaLinks,
    UserStats,
)
from ..database import get_database
from ..dependencies import get_current_user  # For authentication

router = APIRouter(prefix="/api/users", tags=["Users"])


# Helper function to serialize MongoDB user
def user_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse"""
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        location=user["location"],
        bio=user.get("bio"),
        profile_picture=user.get("profile_picture"),
        dietary_preferences=user.get("dietary_preferences", {}),
        social_media=user.get("social_media", {}),
        role=user["role"],
        status=user["status"],
        stats=user.get("stats", {}),
        created_at=user["created_at"],
        verified=user.get("verified", False),
    )


# Get current user profile
@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile"""
    return user_to_response(current_user)


# Get user by ID (public profile)
@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str):
    """Get a user's public profile by ID"""
    db = get_database()

    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID"
        )

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user_to_response(user)


# Update user profile
@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate, current_user: dict = Depends(get_current_user)
):
    """Update the authenticated user's profile"""
    db = get_database()

    # Build update document (only include fields that were provided)
    update_data = {"updated_at": datetime.utcnow()}

    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name
    if user_update.phone is not None:
        update_data["phone"] = user_update.phone
    if user_update.location is not None:
        update_data["location"] = user_update.location.dict()
    if user_update.bio is not None:
        update_data["bio"] = user_update.bio
    if user_update.profile_picture is not None:
        update_data["profile_picture"] = user_update.profile_picture
    if user_update.dietary_preferences is not None:
        update_data["dietary_preferences"] = user_update.dietary_preferences.dict()
    if user_update.social_media is not None:
        update_data["social_media"] = user_update.social_media.dict()

    # Update user
    result = await db.users.update_one(
        {"_id": current_user["_id"]}, {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No changes made to profile"
        )

    # Fetch updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return user_to_response(updated_user)


# Update dietary preferences
@router.put("/me/dietary-preferences", response_model=UserResponse)
async def update_dietary_preferences(
    preferences: DietaryPreferences, current_user: dict = Depends(get_current_user)
):
    """Update user's dietary preferences and restrictions"""
    db = get_database()

    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "dietary_preferences": preferences.dict(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update dietary preferences",
        )

    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return user_to_response(updated_user)


# Update social media links
@router.put("/me/social-media", response_model=UserResponse)
async def update_social_media(
    social_media: SocialMediaLinks, current_user: dict = Depends(get_current_user)
):
    """Update user's social media links for identity verification"""
    db = get_database()

    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "social_media": social_media.dict(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update social media links",
        )

    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return user_to_response(updated_user)


# Delete user account
@router.delete("/me")
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    """Delete the authenticated user's account"""
    db = get_database()

    # Delete all user's meals
    await db.meals.delete_many({"seller_id": current_user["_id"]})

    # Delete all user's reviews
    await db.reviews.delete_many({"reviewer_id": current_user["_id"]})

    # Delete user
    result = await db.users.delete_one({"_id": current_user["_id"]})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {"message": "Account successfully deleted"}


# Get user's statistics
@router.get("/me/stats", response_model=UserStats)
async def get_my_stats(current_user: dict = Depends(get_current_user)):
    """Get the authenticated user's statistics and badges"""
    return current_user.get("stats", UserStats())
