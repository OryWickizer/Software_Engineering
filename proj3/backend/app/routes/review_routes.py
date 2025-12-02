from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    UserReviewsSummary,
)
from app.database import get_database
from app.dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])


def serialize_review(review: dict) -> dict:
    """Convert MongoDB review document to API response format"""
    review["id"] = str(review["_id"])
    review["reviewer_id"] = str(review["reviewer_id"])
    review["meal_id"] = str(review["meal_id"])
    review["seller_id"] = str(review["seller_id"])
    del review["_id"]
    return review


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate, current_user: dict = Depends(get_current_user)
):
    """
    Create a new review for a meal and its seller.
    Users can only review meals they have purchased or swapped.
    """
    db = get_database()

    # Verify the meal exists
    meal = await db.meals.find_one({"_id": ObjectId(review_data.meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    # Verify seller exists
    seller = await db.users.find_one({"_id": ObjectId(review_data.seller_id)})
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
        )

    # Check if user is trying to review their own meal
    if str(meal["seller_id"]) == str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot review your own meal",
        )

    # Check if user already reviewed this meal
    existing_review = await db.reviews.find_one(
        {
            "meal_id": ObjectId(review_data.meal_id),
            "reviewer_id": current_user["_id"],
        }
    )
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this meal",
        )

    # TODO: In production, verify that user actually purchased/swapped this meal
    # by checking transactions collection

    # Create review document
    review_doc = {
        "reviewer_id": current_user["_id"],
        "reviewer_name": current_user["full_name"],
        "reviewer_profile_picture": current_user.get("profile_picture"),
        "meal_id": ObjectId(review_data.meal_id),
        "meal_title": meal["title"],
        "seller_id": ObjectId(review_data.seller_id),
        "rating": review_data.rating,
        "comment": review_data.comment,
        "transaction_type": review_data.transaction_type,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.reviews.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id

    # Update seller's average rating and review count
    await update_seller_stats(db, review_data.seller_id)

    return ReviewResponse(**serialize_review(review_doc))


@router.get("/user/{user_id}", response_model=UserReviewsSummary)
async def get_user_reviews(
    user_id: str, limit: int = 10, skip: int = 0
):
    """
    Get all reviews for a specific user (seller).
    This will be displayed on the user's bio page.
    """
    db = get_database()

    # Verify user exists
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get all reviews for this seller
    reviews_cursor = db.reviews.find({"seller_id": ObjectId(user_id)}).sort(
        "created_at", -1
    )
    all_reviews = await reviews_cursor.to_list(length=None)

    # Calculate statistics
    total_reviews = len(all_reviews)
    average_rating = 0.0
    rating_distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}

    if total_reviews > 0:
        total_rating = sum(review["rating"] for review in all_reviews)
        average_rating = round(total_rating / total_reviews, 1)

        # Count rating distribution
        for review in all_reviews:
            rating_key = str(int(review["rating"]))
            rating_distribution[rating_key] += 1

    # Get recent reviews with pagination
    recent_reviews_cursor = db.reviews.find({"seller_id": ObjectId(user_id)}).sort(
        "created_at", -1
    ).skip(skip).limit(limit)
    recent_reviews = await recent_reviews_cursor.to_list(length=limit)

    recent_reviews_response = [
        ReviewResponse(**serialize_review(review)) for review in recent_reviews
    ]

    return UserReviewsSummary(
        total_reviews=total_reviews,
        average_rating=average_rating,
        rating_distribution=rating_distribution,
        recent_reviews=recent_reviews_response,
    )


@router.get("/meal/{meal_id}", response_model=List[ReviewResponse])
async def get_meal_reviews(meal_id: str):
    """
    Get all reviews for a specific meal.
    """
    db = get_database()

    # Verify meal exists
    meal = await db.meals.find_one({"_id": ObjectId(meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    # Get all reviews for this meal
    reviews_cursor = db.reviews.find({"meal_id": ObjectId(meal_id)}).sort(
        "created_at", -1
    )
    reviews = await reviews_cursor.to_list(length=None)

    return [ReviewResponse(**serialize_review(review)) for review in reviews]


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update an existing review.
    Users can only update their own reviews.
    """
    db = get_database()

    # Find the review
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Review not found"
        )

    # Check if current user owns this review
    if str(review["reviewer_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews",
        )

    # Update only provided fields
    update_data = {
        k: v for k, v in review_update.dict(exclude_unset=True).items() if v is not None
    }
    update_data["updated_at"] = datetime.utcnow()

    await db.reviews.update_one({"_id": ObjectId(review_id)}, {"$set": update_data})

    # Get updated review
    updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})

    # Update seller's average rating
    await update_seller_stats(db, str(review["seller_id"]))

    return ReviewResponse(**serialize_review(updated_review))


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str, current_user: dict = Depends(get_current_user)
):
    """
    Delete a review.
    Users can only delete their own reviews.
    """
    db = get_database()

    # Find the review
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Review not found"
        )

    # Check if current user owns this review
    if str(review["reviewer_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews",
        )

    seller_id = str(review["seller_id"])

    # Delete the review
    await db.reviews.delete_one({"_id": ObjectId(review_id)})

    # Update seller's average rating
    await update_seller_stats(db, seller_id)

    return None


@router.get("/my-reviews", response_model=List[ReviewResponse])
async def get_my_reviews(current_user: dict = Depends(get_current_user)):
    """
    Get all reviews written by the current user.
    """
    db = get_database()

    reviews_cursor = db.reviews.find({"reviewer_id": current_user["_id"]}).sort(
        "created_at", -1
    )
    reviews = await reviews_cursor.to_list(length=None)

    return [ReviewResponse(**serialize_review(review)) for review in reviews]


async def update_seller_stats(db, seller_id: str):
    """
    Update seller's average rating and total reviews count.
    Called after creating, updating, or deleting a review.
    """
    reviews_cursor = db.reviews.find({"seller_id": ObjectId(seller_id)})
    reviews = await reviews_cursor.to_list(length=None)

    total_reviews = len(reviews)
    average_rating = 0.0

    if total_reviews > 0:
        total_rating = sum(review["rating"] for review in reviews)
        average_rating = round(total_rating / total_reviews, 1)

    # Update user stats
    await db.users.update_one(
        {"_id": ObjectId(seller_id)},
        {
            "$set": {
                "stats.average_rating": average_rating,
                "stats.total_reviews": total_reviews,
            }
        },
    )
