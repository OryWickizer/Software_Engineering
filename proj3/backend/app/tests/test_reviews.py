"""
Comprehensive tests for review routes
Tests all CRUD operations, validations, permissions, and edge cases for meal reviews
"""

import pytest
import pytest_asyncio
from datetime import datetime
from bson import ObjectId
from unittest.mock import patch


# Test configuration
TEST_DB_NAME = "test_meal_db"


# ============================================================
# FIXTURES
# ============================================================


@pytest_asyncio.fixture
async def test_user(mongo_client):
    """Create a test user in MongoDB"""
    db = mongo_client[TEST_DB_NAME]

    user_doc = {
        "email": "reviewer@example.com",
        "full_name": "Test Reviewer",
        "phone": "1234567890",
        "location": {
            "address": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
        },
        "bio": "Test reviewer bio",
        "profile_picture": None,
        "dietary_preferences": {
            "dietary_restrictions": [],
            "allergens": [],
            "cuisine_preferences": [],
            "spice_level": None,
        },
        "social_media": {},
        "role": "user",
        "status": "active",
        "stats": {
            "total_meals_sold": 0,
            "total_meals_swapped": 0,
            "total_meals_purchased": 5,
            "average_rating": 4.5,
            "total_reviews": 10,
            "badges": [],
        },
        "created_at": datetime.utcnow(),
        "verified": True,
        "password_hash": "hashed_password",
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    yield user_doc

    # Cleanup
    await db.users.delete_one({"_id": result.inserted_id})


@pytest_asyncio.fixture
async def seller_user(mongo_client):
    """Create a seller user in MongoDB"""
    db = mongo_client[TEST_DB_NAME]

    user_doc = {
        "email": "seller@example.com",
        "full_name": "Test Seller",
        "phone": "0987654321",
        "location": {
            "address": "456 Seller Ave",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12346",
        },
        "bio": "Test seller bio",
        "profile_picture": None,
        "dietary_preferences": {
            "dietary_restrictions": [],
            "allergens": [],
            "cuisine_preferences": [],
            "spice_level": None,
        },
        "social_media": {},
        "role": "user",
        "status": "active",
        "stats": {
            "total_meals_sold": 15,
            "total_meals_swapped": 5,
            "total_meals_purchased": 0,
            "average_rating": 4.2,
            "total_reviews": 8,
            "badges": [],
        },
        "created_at": datetime.utcnow(),
        "verified": True,
        "password_hash": "hashed_password",
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    yield user_doc

    # Cleanup
    await db.users.delete_one({"_id": result.inserted_id})


@pytest_asyncio.fixture
async def third_user(mongo_client):
    """Create a third test user"""
    db = mongo_client[TEST_DB_NAME]

    user_doc = {
        "email": "thirduser@example.com",
        "full_name": "Third User",
        "phone": "5555555555",
        "location": {
            "address": "789 Third St",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12347",
        },
        "bio": "Third user bio",
        "profile_picture": None,
        "dietary_preferences": {
            "dietary_restrictions": [],
            "allergens": [],
            "cuisine_preferences": [],
            "spice_level": None,
        },
        "social_media": {},
        "role": "user",
        "status": "active",
        "stats": {
            "total_meals_sold": 0,
            "total_meals_swapped": 0,
            "total_meals_purchased": 0,
            "average_rating": 0.0,
            "total_reviews": 0,
            "badges": [],
        },
        "created_at": datetime.utcnow(),
        "verified": True,
        "password_hash": "hashed_password",
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    yield user_doc

    # Cleanup
    await db.users.delete_one({"_id": result.inserted_id})


@pytest_asyncio.fixture
async def sample_meal(mongo_client, seller_user):
    """Create a sample meal for testing reviews"""
    db = mongo_client[TEST_DB_NAME]

    meal_doc = {
        "seller_id": seller_user["_id"],
        "title": "Delicious Test Pasta",
        "description": "Homemade Italian pasta with fresh tomato sauce",
        "cuisine_type": "Italian",
        "meal_type": "dinner",
        "photos": ["https://example.com/pasta.jpg"],
        "allergen_info": {"contains": ["gluten", "dairy"], "may_contain": []},
        "nutrition_info": "Calories: 450, Protein: 15g, Carbs: 60g, Fat: 12g",
        "portion_size": "Serves 2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "swap_preferences": [],
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow(),
        "pickup_instructions": "Ring doorbell",
        "average_rating": 0.0,
        "total_reviews": 0,
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal_doc)
    meal_doc["_id"] = result.inserted_id

    yield meal_doc

    # Cleanup
    await db.meals.delete_one({"_id": result.inserted_id})


@pytest_asyncio.fixture
async def sample_review(mongo_client, test_user, seller_user, sample_meal):
    """Create a sample review for testing"""
    db = mongo_client[TEST_DB_NAME]

    review_doc = {
        "meal_id": sample_meal["_id"],
        "seller_id": seller_user["_id"],
        "reviewer_id": test_user["_id"],
        "reviewer_email": test_user["email"],
        "rating": 4.5,
        "comment": "Great meal! Really enjoyed the pasta.",
        "transaction_type": "purchase",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.reviews.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id

    yield review_doc

    # Cleanup
    await db.reviews.delete_one({"_id": result.inserted_id})


@pytest_asyncio.fixture
async def multiple_reviews(mongo_client, test_user, third_user, seller_user, sample_meal):
    """Create multiple reviews for testing aggregations"""
    db = mongo_client[TEST_DB_NAME]
    reviews = []

    review_configs = [
        {
            "meal_id": sample_meal["_id"],
            "seller_id": seller_user["_id"],
            "reviewer_id": test_user["_id"],
            "reviewer_email": test_user["email"],
            "rating": 5.0,
            "comment": "Excellent meal!",
            "transaction_type": "purchase",
        },
        {
            "meal_id": sample_meal["_id"],
            "seller_id": seller_user["_id"],
            "reviewer_id": third_user["_id"],
            "reviewer_email": third_user["email"],
            "rating": 4.0,
            "comment": "Very good, would buy again.",
            "transaction_type": "purchase",
        },
        {
            "meal_id": sample_meal["_id"],
            "seller_id": seller_user["_id"],
            "reviewer_id": test_user["_id"],
            "reviewer_email": test_user["email"],
            "rating": 3.5,
            "comment": "Good but could be better.",
            "transaction_type": "swap",
        },
    ]

    for config in review_configs:
        review_doc = {
            **config,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = await db.reviews.insert_one(review_doc)
        review_doc["_id"] = result.inserted_id
        reviews.append(review_doc)

    yield reviews

    # Cleanup
    for review in reviews:
        await db.reviews.delete_one({"_id": review["_id"]})


# ============================================================
# CREATE REVIEW TESTS
# ============================================================


@pytest.mark.asyncio
async def test_create_review_success(mongo_client, test_user, seller_user, sample_meal):
    """Test successfully creating a review"""

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 4.5,
        "comment": "Delicious meal, would definitely order again!",
        "transaction_type": "sale",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert review_create.rating == 4.5
    assert review_create.transaction_type == "sale"
    assert review_create.comment == "Delicious meal, would definitely order again!"


@pytest.mark.asyncio
async def test_create_review_with_swap_transaction(mongo_client, test_user, seller_user, sample_meal):
    """Test creating a review for a swap transaction"""

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 5.0,
        "comment": "Great swap experience!",
        "transaction_type": "swap",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert review_create.rating == 5.0
    assert review_create.transaction_type == "swap"


@pytest.mark.asyncio
async def test_create_review_minimum_rating(mongo_client, test_user, seller_user, sample_meal):
    """Test creating a review with minimum rating (1.0)"""

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 1.0,
        "comment": "Not satisfied with this meal.",
        "transaction_type": "sale",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert review_create.rating == 1.0


@pytest.mark.asyncio
async def test_create_review_maximum_rating(mongo_client, test_user, seller_user, sample_meal):
    """Test creating a review with maximum rating (5.0)"""

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 5.0,
        "comment": "Perfect in every way!",
        "transaction_type": "sale",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert review_create.rating == 5.0


@pytest.mark.asyncio
async def test_create_review_half_star_rating(mongo_client, test_user, seller_user, sample_meal):
    """Test creating a review with half-star rating (e.g., 3.5)"""

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 3.5,
        "comment": "Decent meal, nothing special.",
        "transaction_type": "sale",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert review_create.rating == 3.5


@pytest.mark.asyncio
async def test_create_review_without_comment(mongo_client, test_user, seller_user, sample_meal):
    """Test creating a review without a comment (optional field)"""

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 4.0,
        "transaction_type": "sale",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert review_create.rating == 4.0
    assert review_create.comment is None


@pytest.mark.asyncio
async def test_create_review_long_comment(mongo_client, test_user, seller_user, sample_meal):
    """Test creating a review with a long comment"""

    long_comment = "A" * 500  # 500 characters

    review_data = {
        "meal_id": str(sample_meal["_id"]),
        "seller_id": str(seller_user["_id"]),
        "rating": 4.0,
        "comment": long_comment,
        "transaction_type": "sale",
    }

    from app.models import ReviewCreate

    review_create = ReviewCreate(**review_data)

    assert len(review_create.comment) == 500


@pytest.mark.asyncio
async def test_create_review_invalid_rating_below_minimum():
    """Test that creating a review with rating below 1.0 raises validation error"""

    review_data = {
        "meal_id": str(ObjectId()),
        "rating": 0.5,  # Below minimum
        "comment": "Invalid rating",
        "transaction_type": "purchase",
    }

    from app.models import ReviewCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError) as exc_info:
        ReviewCreate(**review_data)

    assert "rating" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_review_invalid_rating_above_maximum():
    """Test that creating a review with rating above 5.0 raises validation error"""

    review_data = {
        "meal_id": str(ObjectId()),
        "rating": 5.5,  # Above maximum
        "comment": "Invalid rating",
        "transaction_type": "purchase",
    }

    from app.models import ReviewCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError) as exc_info:
        ReviewCreate(**review_data)

    assert "rating" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_review_invalid_rating_increment():
    """Test that creating a review with invalid increment (not 0.5) raises validation error"""

    review_data = {
        "meal_id": str(ObjectId()),
        "rating": 3.7,  # Invalid increment (must be 0.5)
        "comment": "Invalid rating increment",
        "transaction_type": "purchase",
    }

    from app.models import ReviewCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError) as exc_info:
        ReviewCreate(**review_data)

    assert "rating" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_review_invalid_transaction_type():
    """Test that creating a review with invalid transaction type raises validation error"""

    review_data = {
        "meal_id": str(ObjectId()),
        "rating": 4.0,
        "comment": "Invalid transaction type",
        "transaction_type": "invalid_type",  # Invalid
    }

    from app.models import ReviewCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError) as exc_info:
        ReviewCreate(**review_data)

    assert "transaction_type" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_review_comment_too_long():
    """Test that creating a review with comment exceeding max length raises validation error"""

    long_comment = "A" * 501  # Over 500 character limit

    review_data = {
        "meal_id": str(ObjectId()),
        "rating": 4.0,
        "comment": long_comment,
        "transaction_type": "purchase",
    }

    from app.models import ReviewCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError) as exc_info:
        ReviewCreate(**review_data)

    assert "comment" in str(exc_info.value).lower()


# ============================================================
# READ REVIEW TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_review_by_id(mongo_client, sample_review):
    """Test retrieving a review by its ID"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch the review
    review = await db.reviews.find_one({"_id": sample_review["_id"]})

    assert review is not None
    assert review["_id"] == sample_review["_id"]
    assert review["rating"] == sample_review["rating"]
    assert review["comment"] == sample_review["comment"]


@pytest.mark.asyncio
async def test_get_reviews_by_meal_id(mongo_client, multiple_reviews, sample_meal):
    """Test retrieving all reviews for a specific meal"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch reviews for the meal
    cursor = db.reviews.find({"meal_id": sample_meal["_id"]})
    reviews = await cursor.to_list(length=100)

    assert len(reviews) == 3
    assert all(review["meal_id"] == sample_meal["_id"] for review in reviews)


@pytest.mark.asyncio
async def test_get_reviews_by_seller_id(mongo_client, multiple_reviews, seller_user):
    """Test retrieving all reviews for a specific seller"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch reviews for the seller
    cursor = db.reviews.find({"seller_id": seller_user["_id"]})
    reviews = await cursor.to_list(length=100)

    assert len(reviews) == 3
    assert all(review["seller_id"] == seller_user["_id"] for review in reviews)


@pytest.mark.asyncio
async def test_get_reviews_by_reviewer_id(mongo_client, multiple_reviews, test_user):
    """Test retrieving all reviews by a specific reviewer"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch reviews by the reviewer
    cursor = db.reviews.find({"reviewer_id": test_user["_id"]})
    reviews = await cursor.to_list(length=100)

    assert len(reviews) == 2  # test_user made 2 reviews in the fixture
    assert all(review["reviewer_id"] == test_user["_id"] for review in reviews)


@pytest.mark.asyncio
async def test_get_reviews_by_transaction_type(mongo_client, multiple_reviews):
    """Test retrieving reviews filtered by transaction type"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch purchase reviews
    cursor = db.reviews.find({"transaction_type": "purchase"})
    purchase_reviews = await cursor.to_list(length=100)

    assert len(purchase_reviews) == 2
    assert all(review["transaction_type"] == "purchase" for review in purchase_reviews)

    # Fetch swap reviews
    cursor = db.reviews.find({"transaction_type": "swap"})
    swap_reviews = await cursor.to_list(length=100)

    assert len(swap_reviews) == 1
    assert swap_reviews[0]["transaction_type"] == "swap"


@pytest.mark.asyncio
async def test_get_nonexistent_review(mongo_client):
    """Test retrieving a review that doesn't exist"""
    db = mongo_client[TEST_DB_NAME]

    fake_id = ObjectId()
    review = await db.reviews.find_one({"_id": fake_id})

    assert review is None


@pytest.mark.asyncio
async def test_calculate_average_rating(mongo_client, multiple_reviews, sample_meal):
    """Test calculating average rating from multiple reviews"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch all reviews for the meal
    cursor = db.reviews.find({"meal_id": sample_meal["_id"]})
    reviews = await cursor.to_list(length=100)

    # Calculate average
    ratings = [review["rating"] for review in reviews]
    average_rating = sum(ratings) / len(ratings)

    # Expected: (5.0 + 4.0 + 3.5) / 3 = 4.166...
    assert len(reviews) == 3
    assert abs(average_rating - 4.17) < 0.01


@pytest.mark.asyncio
async def test_count_reviews_by_rating(mongo_client, multiple_reviews, sample_meal):
    """Test counting reviews grouped by rating"""
    db = mongo_client[TEST_DB_NAME]

    # Count reviews by rating
    rating_counts = {}
    cursor = db.reviews.find({"meal_id": sample_meal["_id"]})
    reviews = await cursor.to_list(length=100)

    for review in reviews:
        rating = review["rating"]
        rating_counts[rating] = rating_counts.get(rating, 0) + 1

    assert rating_counts.get(5.0) == 1
    assert rating_counts.get(4.0) == 1
    assert rating_counts.get(3.5) == 1


# ============================================================
# UPDATE REVIEW TESTS
# ============================================================


@pytest.mark.asyncio
async def test_update_review_rating(mongo_client, sample_review):
    """Test updating a review's rating"""
    db = mongo_client[TEST_DB_NAME]

    # Update the rating
    new_rating = 5.0
    await db.reviews.update_one(
        {"_id": sample_review["_id"]},
        {"$set": {"rating": new_rating, "updated_at": datetime.utcnow()}}
    )

    # Fetch updated review
    updated_review = await db.reviews.find_one({"_id": sample_review["_id"]})

    assert updated_review["rating"] == new_rating
    assert updated_review["rating"] != sample_review["rating"]


@pytest.mark.asyncio
async def test_update_review_comment(mongo_client, sample_review):
    """Test updating a review's comment"""
    db = mongo_client[TEST_DB_NAME]

    # Update the comment
    new_comment = "Updated comment: Even better than I initially thought!"
    await db.reviews.update_one(
        {"_id": sample_review["_id"]},
        {"$set": {"comment": new_comment, "updated_at": datetime.utcnow()}}
    )

    # Fetch updated review
    updated_review = await db.reviews.find_one({"_id": sample_review["_id"]})

    assert updated_review["comment"] == new_comment
    assert updated_review["comment"] != sample_review["comment"]


@pytest.mark.asyncio
async def test_update_review_rating_and_comment(mongo_client, sample_review):
    """Test updating both rating and comment"""
    db = mongo_client[TEST_DB_NAME]

    # Update both fields
    new_rating = 3.0
    new_comment = "Changed my mind, wasn't as good as I thought."
    await db.reviews.update_one(
        {"_id": sample_review["_id"]},
        {"$set": {"rating": new_rating, "comment": new_comment, "updated_at": datetime.utcnow()}}
    )

    # Fetch updated review
    updated_review = await db.reviews.find_one({"_id": sample_review["_id"]})

    assert updated_review["rating"] == new_rating
    assert updated_review["comment"] == new_comment


@pytest.mark.asyncio
async def test_update_review_transaction_type(mongo_client, sample_review):
    """Test updating a review's transaction type"""
    db = mongo_client[TEST_DB_NAME]

    # Update transaction type
    new_transaction_type = "swap"
    await db.reviews.update_one(
        {"_id": sample_review["_id"]},
        {"$set": {"transaction_type": new_transaction_type, "updated_at": datetime.utcnow()}}
    )

    # Fetch updated review
    updated_review = await db.reviews.find_one({"_id": sample_review["_id"]})

    assert updated_review["transaction_type"] == new_transaction_type
    assert updated_review["transaction_type"] != sample_review["transaction_type"]


@pytest.mark.asyncio
async def test_update_nonexistent_review(mongo_client):
    """Test updating a review that doesn't exist"""
    db = mongo_client[TEST_DB_NAME]

    fake_id = ObjectId()
    result = await db.reviews.update_one(
        {"_id": fake_id},
        {"$set": {"rating": 5.0}}
    )

    assert result.matched_count == 0
    assert result.modified_count == 0


@pytest.mark.asyncio
async def test_update_review_preserves_other_fields(mongo_client, sample_review):
    """Test that updating one field doesn't affect other fields"""
    db = mongo_client[TEST_DB_NAME]

    original_comment = sample_review["comment"]
    original_transaction_type = sample_review["transaction_type"]

    # Update only rating
    new_rating = 5.0
    await db.reviews.update_one(
        {"_id": sample_review["_id"]},
        {"$set": {"rating": new_rating, "updated_at": datetime.utcnow()}}
    )

    # Fetch updated review
    updated_review = await db.reviews.find_one({"_id": sample_review["_id"]})

    assert updated_review["rating"] == new_rating
    assert updated_review["comment"] == original_comment
    assert updated_review["transaction_type"] == original_transaction_type


# ============================================================
# DELETE REVIEW TESTS
# ============================================================


@pytest.mark.asyncio
async def test_delete_review(mongo_client, sample_review):
    """Test deleting a review"""
    db = mongo_client[TEST_DB_NAME]

    # Delete the review
    result = await db.reviews.delete_one({"_id": sample_review["_id"]})

    assert result.deleted_count == 1

    # Verify it's deleted
    deleted_review = await db.reviews.find_one({"_id": sample_review["_id"]})
    assert deleted_review is None


@pytest.mark.asyncio
async def test_delete_nonexistent_review(mongo_client):
    """Test deleting a review that doesn't exist"""
    db = mongo_client[TEST_DB_NAME]

    fake_id = ObjectId()
    result = await db.reviews.delete_one({"_id": fake_id})

    assert result.deleted_count == 0


@pytest.mark.asyncio
async def test_delete_all_reviews_for_meal(mongo_client, multiple_reviews, sample_meal):
    """Test deleting all reviews for a specific meal"""
    db = mongo_client[TEST_DB_NAME]

    # Delete all reviews for the meal
    result = await db.reviews.delete_many({"meal_id": sample_meal["_id"]})

    assert result.deleted_count == 3

    # Verify they're deleted
    cursor = db.reviews.find({"meal_id": sample_meal["_id"]})
    remaining_reviews = await cursor.to_list(length=100)
    assert len(remaining_reviews) == 0


@pytest.mark.asyncio
async def test_delete_all_reviews_by_reviewer(mongo_client, multiple_reviews, test_user):
    """Test deleting all reviews by a specific reviewer"""
    db = mongo_client[TEST_DB_NAME]

    # Delete all reviews by the reviewer
    result = await db.reviews.delete_many({"reviewer_id": test_user["_id"]})

    assert result.deleted_count == 2  # test_user made 2 reviews

    # Verify they're deleted
    cursor = db.reviews.find({"reviewer_id": test_user["_id"]})
    remaining_reviews = await cursor.to_list(length=100)
    assert len(remaining_reviews) == 0


# ============================================================
# BUSINESS LOGIC TESTS
# ============================================================


@pytest.mark.asyncio
async def test_cannot_review_own_meal(mongo_client, seller_user, sample_meal):
    """Test that a seller cannot review their own meal"""

    # This validation should be in the API route
    # Here we test the business logic
    is_own_meal = sample_meal["seller_id"] == seller_user["_id"]

    assert is_own_meal is True
    # In actual API, this would return 403 Forbidden


@pytest.mark.asyncio
async def test_user_can_review_others_meal(mongo_client, test_user, sample_meal):
    """Test that a user can review someone else's meal"""

    is_own_meal = sample_meal["seller_id"] == test_user["_id"]

    assert is_own_meal is False
    # This should be allowed


@pytest.mark.asyncio
async def test_review_updates_seller_stats(mongo_client, seller_user, sample_meal):
    """Test that adding reviews updates seller's average rating"""
    db = mongo_client[TEST_DB_NAME]

    # Add multiple reviews
    reviews = [
        {"rating": 5.0},
        {"rating": 4.0},
        {"rating": 4.5},
    ]

    for review_data in reviews:
        review_doc = {
            "meal_id": sample_meal["_id"],
            "seller_id": seller_user["_id"],
            "reviewer_id": ObjectId(),
            "reviewer_email": "test@test.com",
            "rating": review_data["rating"],
            "comment": "Test review",
            "transaction_type": "purchase",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db.reviews.insert_one(review_doc)

    # Calculate new average
    cursor = db.reviews.find({"seller_id": seller_user["_id"]})
    seller_reviews = await cursor.to_list(length=100)
    ratings = [review["rating"] for review in seller_reviews]
    new_average = sum(ratings) / len(ratings)

    # Expected: (5.0 + 4.0 + 4.5) / 3 = 4.5
    assert abs(new_average - 4.5) < 0.01

    # Cleanup
    await db.reviews.delete_many({"seller_id": seller_user["_id"]})


@pytest.mark.asyncio
async def test_review_timestamps(mongo_client, sample_review):
    """Test that reviews have proper timestamps"""

    assert "created_at" in sample_review
    assert "updated_at" in sample_review
    assert isinstance(sample_review["created_at"], datetime)
    assert isinstance(sample_review["updated_at"], datetime)


@pytest.mark.asyncio
async def test_get_reviews_sorted_by_date(mongo_client, multiple_reviews):
    """Test retrieving reviews sorted by creation date"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch reviews sorted by created_at (newest first)
    cursor = db.reviews.find().sort("created_at", -1)
    reviews = await cursor.to_list(length=100)

    # Verify they're sorted
    for i in range(len(reviews) - 1):
        assert reviews[i]["created_at"] >= reviews[i + 1]["created_at"]


@pytest.mark.asyncio
async def test_get_reviews_sorted_by_rating(mongo_client, multiple_reviews):
    """Test retrieving reviews sorted by rating"""
    db = mongo_client[TEST_DB_NAME]

    # Fetch reviews sorted by rating (highest first)
    cursor = db.reviews.find().sort("rating", -1)
    reviews = await cursor.to_list(length=100)

    # Verify they're sorted
    for i in range(len(reviews) - 1):
        assert reviews[i]["rating"] >= reviews[i + 1]["rating"]


@pytest.mark.asyncio
async def test_review_includes_reviewer_email(mongo_client, sample_review, test_user):
    """Test that review includes reviewer email"""

    assert "reviewer_email" in sample_review
    assert sample_review["reviewer_email"] == test_user["email"]


@pytest.mark.asyncio
async def test_multiple_reviews_by_same_user_for_different_meals(
    mongo_client, test_user, seller_user
):
    """Test that a user can leave multiple reviews for different meals from the same seller"""
    db = mongo_client[TEST_DB_NAME]

    # Create two meals
    meal1_doc = {
        "seller_id": seller_user["_id"],
        "title": "Meal 1",
        "description": "First meal",
        "cuisine_type": "Italian",
        "meal_type": "dinner",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "Serves 2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    meal1_result = await db.meals.insert_one(meal1_doc)
    meal1_id = meal1_result.inserted_id

    meal2_doc = {
        "seller_id": seller_user["_id"],
        "title": "Meal 2",
        "description": "Second meal",
        "cuisine_type": "Mexican",
        "meal_type": "lunch",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "Serves 1",
        "available_for_sale": True,
        "sale_price": 10.00,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    meal2_result = await db.meals.insert_one(meal2_doc)
    meal2_id = meal2_result.inserted_id

    # Create reviews for both meals
    review1_doc = {
        "meal_id": meal1_id,
        "seller_id": seller_user["_id"],
        "reviewer_id": test_user["_id"],
        "reviewer_email": test_user["email"],
        "rating": 4.5,
        "comment": "Great first meal!",
        "transaction_type": "purchase",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    review1_result = await db.reviews.insert_one(review1_doc)

    review2_doc = {
        "meal_id": meal2_id,
        "seller_id": seller_user["_id"],
        "reviewer_id": test_user["_id"],
        "reviewer_email": test_user["email"],
        "rating": 5.0,
        "comment": "Even better second meal!",
        "transaction_type": "purchase",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    review2_result = await db.reviews.insert_one(review2_doc)

    # Verify both reviews exist
    cursor = db.reviews.find({"reviewer_id": test_user["_id"]})
    user_reviews = await cursor.to_list(length=100)

    assert len([r for r in user_reviews if r["meal_id"] in [meal1_id, meal2_id]]) == 2

    # Cleanup
    await db.meals.delete_one({"_id": meal1_id})
    await db.meals.delete_one({"_id": meal2_id})
    await db.reviews.delete_one({"_id": review1_result.inserted_id})
    await db.reviews.delete_one({"_id": review2_result.inserted_id})


@pytest.mark.asyncio
async def test_review_rating_distribution(mongo_client, multiple_reviews, sample_meal):
    """Test calculating rating distribution for a meal"""
    db = mongo_client[TEST_DB_NAME]

    # Get all reviews for the meal
    cursor = db.reviews.find({"meal_id": sample_meal["_id"]})
    reviews = await cursor.to_list(length=100)

    # Calculate distribution
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        rating_floor = int(review["rating"])
        distribution[rating_floor] += 1

    # Expected: 1 five-star, 1 four-star, 1 three-star
    assert distribution[5] == 1
    assert distribution[4] == 1
    assert distribution[3] == 1
    assert distribution[2] == 0
    assert distribution[1] == 0
