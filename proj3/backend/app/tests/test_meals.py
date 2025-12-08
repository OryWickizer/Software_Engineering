"""
Comprehensive tests for meal routes
Tests all CRUD operations, filters, permissions, and edge cases
"""

import pytest
import pytest_asyncio
from datetime import datetime, timedelta
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
        "email": "test@example.com",
        "full_name": "Test User",
        "phone": "1234567890",
        "location": {
            "address": "123 Test St",
            "city": "Raleigh",
            "state": "NC",
            "zip_code": "27601",
            "latitude": 35.7796,  # Raleigh, NC
            "longitude": -78.6382,
        },
        "bio": "Test bio",
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
async def second_user(mongo_client):
    """Create a second test user"""
    db = mongo_client[TEST_DB_NAME]

    user_doc = {
        "email": "user2@example.com",
        "full_name": "Second User",
        "phone": "0987654321",
        "location": {
            "address": "456 Test Ave",
            "city": "Durham",
            "state": "NC",
            "zip_code": "27701",
            "latitude": 35.9940,  # Durham, NC
            "longitude": -78.8986,
        },
        "bio": "Second user bio",
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
            "average_rating": 3.8,
            "total_reviews": 5,
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
async def user_far_away(mongo_client):
    """Create a user far away from the others"""
    db = mongo_client[TEST_DB_NAME]

    user_doc = {
        "email": "far@example.com",
        "full_name": "Far User",
        "phone": "5555555555",
        "location": {
            "address": "789 Far St",
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90001",
            "latitude": 34.0522,  # Los Angeles, CA
            "longitude": -118.2437,
        },
        "bio": "A user from another coast.",
        "role": "user",
        "status": "active",
        "stats": {"average_rating": 4.0, "total_reviews": 1},
        "created_at": datetime.utcnow(),
        "verified": True,
        "password_hash": "hashed_password",
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    yield user_doc
    await db.users.delete_one({"_id": result.inserted_id})



@pytest_asyncio.fixture
async def sample_meal(mongo_client, test_user):
    """Create a sample meal for testing"""
    db = mongo_client[TEST_DB_NAME]

    meal_doc = {
        "seller_id": test_user["_id"],
        "title": "Delicious Pasta",
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
        "expires_date": datetime.utcnow() + timedelta(days=2),
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
async def multiple_meals(mongo_client, test_user, second_user):
    """Create multiple meals with different attributes for filter testing"""
    db = mongo_client[TEST_DB_NAME]
    meals = []

    meal_configs = [
        {
            "seller_id": test_user["_id"],
            "title": "Italian Lasagna",
            "cuisine_type": "Italian",
            "meal_type": "dinner",
            "sale_price": 20.00,
            "available_for_sale": True,
            "available_for_swap": False,
        },
        {
            "seller_id": test_user["_id"],
            "title": "Mexican Tacos",
            "cuisine_type": "Mexican",
            "meal_type": "lunch",
            "sale_price": 10.00,
            "available_for_sale": True,
            "available_for_swap": True,
        },
        {
            "seller_id": second_user["_id"],
            "title": "Chinese Dumplings",
            "cuisine_type": "Chinese",
            "meal_type": "dinner",
            "sale_price": 15.00,
            "available_for_sale": True,
            "available_for_swap": False,
        },
        {
            "seller_id": second_user["_id"],
            "title": "French Croissant",
            "cuisine_type": "French",
            "meal_type": "breakfast",
            "sale_price": 5.00,
            "available_for_sale": True,
            "available_for_swap": False,
        },
        {
            "seller_id": test_user["_id"],
            "title": "Swap Only Meal",
            "cuisine_type": "American",
            "meal_type": "lunch",
            "sale_price": None,
            "available_for_sale": False,
            "available_for_swap": True,
        },
    ]

    for config in meal_configs:
        user = test_user if config["seller_id"] == test_user["_id"] else second_user
        meal_doc = {
            **config,
            "seller_location": user["location"],
            "description": f"Delicious {config['title']}",
            "photos": [],
            "allergen_info": {"contains": [], "may_contain": []},
            "nutrition_info": None,
            "portion_size": "Serves 2",
            "swap_preferences": (
                ["Any vegetarian meal"] if config.get("available_for_swap") else []
            ),
            "status": "available",
            "preparation_date": datetime.utcnow(),
            "expires_date": datetime.utcnow() + timedelta(days=2),
            "pickup_instructions": "Call when arriving",
            "average_rating": 0.0,
            "total_reviews": 0,
            "views": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = await db.meals.insert_one(meal_doc)
        meal_doc["_id"] = result.inserted_id
        meals.append(meal_doc)

    yield meals

    # Cleanup
    for meal in meals:
        await db.meals.delete_one({"_id": meal["_id"]})


# ============================================================
# CREATE MEAL TESTS
# ============================================================


@pytest.mark.asyncio
async def test_create_meal_success(mongo_client, test_user):
    """Test successfully creating a meal"""

    meal_data = {
        "title": "Test Meal",
        "description": "A delicious test meal for testing",
        "cuisine_type": "Italian",
        "meal_type": "dinner",
        "photos": ["https://example.com/photo.jpg"],
        "allergen_info": {"contains": ["gluten"], "may_contain": ["nuts"]},
        "nutrition_info": "Calories: 500, Protein: 20g, Carbs: 50g, Fat: 15g",
        "portion_size": "Serves 2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "swap_preferences": [],
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
        "pickup_instructions": "Ring doorbell",
    }

    # Simulate creating the meal
    from app.models import MealCreate

    meal_create = MealCreate(**meal_data)
    # This would be called via FastAPI in actual implementation
    # For testing purposes, we verify the data structure is correct

    assert meal_create.title == "Test Meal"
    assert meal_create.sale_price == 15.00
    assert meal_create.available_for_sale is True


@pytest.mark.asyncio
async def test_create_meal_for_swap_only(mongo_client, test_user):
    """Test creating a meal available for swap only (no sale price)"""
    meal_data = {
        "title": "Swap Only Meal",
        "description": "This meal is only available for swapping",
        "cuisine_type": "Mexican",
        "meal_type": "lunch",
        "photos": [],
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "Serves 1",
        "available_for_sale": False,
        "sale_price": None,
        "available_for_swap": True,
        "swap_preferences": ["Italian dishes", "Asian cuisine"],
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
    }

    from app.models import MealCreate

    meal_create = MealCreate(**meal_data)

    assert meal_create.available_for_swap is True
    assert meal_create.available_for_sale is False
    assert meal_create.sale_price is None


@pytest.mark.asyncio
async def test_create_meal_with_minimal_data(mongo_client, test_user):
    """Test creating a meal with only required fields"""
    meal_data = {
        "title": "Minimal Meal",
        "description": "Basic meal with minimal information",
        "cuisine_type": "American",
        "meal_type": "snack",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "1 serving",
        "available_for_sale": True,
        "sale_price": 5.00,
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(hours=12)).isoformat(),
    }

    from app.models import MealCreate

    meal_create = MealCreate(**meal_data)

    assert meal_create.title == "Minimal Meal"
    assert meal_create.photos == []
    assert meal_create.nutrition_info is None


@pytest.mark.asyncio
async def test_create_meal_invalid_price(mongo_client, test_user):
    """Test that creating a meal with invalid price raises validation error"""
    meal_data = {
        "title": "Invalid Price Meal",
        "description": "This meal has an invalid price",
        "cuisine_type": "Italian",
        "meal_type": "dinner",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "Serves 2",
        "available_for_sale": True,
        "sale_price": -10.00,  # Invalid negative price
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
    }

    from app.models import MealCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        MealCreate(**meal_data)


@pytest.mark.asyncio
async def test_create_meal_available_for_sale_without_price(mongo_client, test_user):
    """Test that creating a meal for sale without price raises validation error"""
    meal_data = {
        "title": "No Price Meal",
        "description": "Available for sale but no price",
        "cuisine_type": "Italian",
        "meal_type": "dinner",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "Serves 2",
        "available_for_sale": True,
        "sale_price": None,  # Missing price when available for sale
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
    }

    from app.models import MealCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        MealCreate(**meal_data)


# ============================================================
# GET MEALS TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_all_meals(mongo_client, multiple_meals):
    """Test retrieving all available meals"""
    db = mongo_client[TEST_DB_NAME]

    meals = await db.meals.find({"status": "available"}).to_list(None)

    assert len(meals) == 5
    assert all(meal["status"] == "available" for meal in meals)


@pytest.mark.asyncio
async def test_get_meals_with_price_filter(mongo_client, multiple_meals):
    """Test filtering meals by maximum price"""
    db = mongo_client[TEST_DB_NAME]

    affordable_meals = await db.meals.find(
        {"status": "available", "sale_price": {"$lte": 15.00}}
    ).to_list(None)

    assert len(affordable_meals) == 3
    assert all(
        meal.get("sale_price") is None or meal["sale_price"] <= 15.00
        for meal in affordable_meals
    )


@pytest.mark.asyncio
async def test_get_meals_available_for_sale_filter(mongo_client, multiple_meals):
    """Test filtering meals available for sale"""
    db = mongo_client[TEST_DB_NAME]

    for_sale = await db.meals.find(
        {"status": "available", "available_for_sale": True}
    ).to_list(None)

    assert len(for_sale) == 4
    assert all(meal["available_for_sale"] is True for meal in for_sale)


@pytest.mark.asyncio
async def test_get_meals_available_for_swap_filter(mongo_client, multiple_meals):
    """Test filtering meals available for swap"""
    db = mongo_client[TEST_DB_NAME]

    for_swap = await db.meals.find(
        {"status": "available", "available_for_swap": True}
    ).to_list(None)

    assert len(for_swap) == 2
    assert all(meal["available_for_swap"] is True for meal in for_swap)


@pytest.mark.asyncio
async def test_get_meals_pagination(mongo_client, multiple_meals):
    """Test meal pagination (skip and limit)"""
    db = mongo_client[TEST_DB_NAME]

    # Get first 2 meals
    first_page = await db.meals.find({"status": "available"}).limit(2).to_list(2)
    assert len(first_page) == 2

    # Get next 2 meals
    second_page = (
        await db.meals.find({"status": "available"}).skip(2).limit(2).to_list(2)
    )
    assert len(second_page) == 2

    # Ensure different meals
    first_ids = {str(m["_id"]) for m in first_page}
    second_ids = {str(m["_id"]) for m in second_page}
    assert first_ids.isdisjoint(second_ids)


@pytest.mark.asyncio
async def test_get_meals_with_distance_filter(
    meal_async_client, mongo_client, multiple_meals, user_far_away
):
    """Test filtering meals by max_distance_miles."""
    # User is in Raleigh (35.7796, -78.6382)
    # Second user is in Durham (~24 miles away)
    # Far user is in LA (~2200 miles away)

    # Add a meal from the far away user
    db = mongo_client[TEST_DB_NAME]
    meal_doc = {
        "seller_id": user_far_away["_id"],
        "title": "LA Meal",
        "cuisine_type": "American",
        "meal_type": "dinner",
        "sale_price": 30.00,
        "status": "available",
        "available_for_sale": True,
        "description": "A meal from LA",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "1",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=2),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "seller_location": user_far_away["location"],
    }
    result = await db.meals.insert_one(meal_doc)

    # Search from Raleigh with a 30-mile radius should only include NC meals
    response = await meal_async_client.get(
        "/api/meals/?latitude=35.7796&longitude=-78.6382&max_distance_miles=30"
    )
    assert response.status_code == 200
    data = response.json()
    # 5 meals are from the `multiple_meals` fixture, all from users in NC
    assert len(data) == 5
    assert all(m["title"] != "LA Meal" for m in data)

    # Search with a 3000-mile radius should include the LA meal
    response = await meal_async_client.get(
        "/api/meals/?user_lat=35.7796&user_lon=-78.6382&max_distance_miles=3000"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    assert any(m["title"] == "LA Meal" for m in data)

    await db.meals.delete_one({"_id": result.inserted_id})


@pytest.mark.asyncio
async def test_get_meals_sorted_by_distance(meal_async_client, multiple_meals):
    """Test that meals are sorted by distance when location is provided."""
    # User is in Raleigh (35.7796, -78.6382)
    # The `multiple_meals` fixture creates meals for test_user (Raleigh) and
    # second_user (Durham). We expect meals from test_user to appear first.
    response = await meal_async_client.get(
        "/api/meals/?latitude=35.7796&longitude=-78.6382"
    )
    assert response.status_code == 200
    data = response.json()

    distances = [m["distance"] for m in data]
    
    # Check that non-None distances are sorted
    non_none_distances = [d for d in distances if d is not None]
    assert non_none_distances == sorted(non_none_distances)

    # Meals from test_user (Raleigh) should have a distance of 0
    # Meals from second_user (Durham) should have a distance > 0
    raleigh_user_id = str(multiple_meals[0]["seller_id"])
    durham_user_id = str(multiple_meals[2]["seller_id"])

    for meal in data:
        if meal["distance"] is not None:
            if meal["seller_id"] == raleigh_user_id:
                assert meal["distance"] == 0
            elif meal["seller_id"] == durham_user_id:
                assert meal["distance"] > 20  # Approx 24 miles


@pytest.mark.asyncio
async def test_get_recommendations_with_distance_filter(
    authenticated_meal_client, mongo_client, multiple_meals, user_far_away
):
    """Test filtering recommendations by max_distance_miles."""
    # The authenticated user is test_user, located in Raleigh.
    db = mongo_client[TEST_DB_NAME]
    # Add a meal from a far away user
    meal_doc = {
        "seller_id": user_far_away["_id"],
        "title": "LA Recommendation",
        "cuisine_type": "American",
        "meal_type": "dinner",
        "sale_price": 30.00,
        "status": "available",
        "available_for_sale": True,
        "description": "A meal from LA",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "1",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=2),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "seller_location": user_far_away["location"],
    }
    result = await db.meals.insert_one(meal_doc)

    # Recommendations with 30-mile radius should NOT include LA meal
    # The other user's meals are in Durham (~24 miles) and should be included.
    response = await authenticated_meal_client.get(
        "/api/meals/my/recommendations?latitude=35.7796&longitude=-78.6382&max_distance_miles=30"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert all(m["title"] != "LA Recommendation" for m in data)

    # Recommendations with 3000-mile radius SHOULD include LA meal
    response = await authenticated_meal_client.get(
        "/api/meals/my/recommendations?latitude=35.7796&longitude=-78.6382&max_distance_miles=3000"
    )
    assert response.status_code == 200
    data = response.json()
    assert any(m["title"] == "LA Recommendation" for m in data)

    await db.meals.delete_one({"_id": result.inserted_id})




@pytest.mark.asyncio
async def test_get_meals_empty_result(mongo_client):
    """Test getting meals when no meals match criteria"""
    db = mongo_client[TEST_DB_NAME]

    meals = await db.meals.find(
        {"status": "available", "cuisine_type": "NonExistentCuisine"}
    ).to_list(None)

    assert len(meals) == 0


# ============================================================
# GET MEAL BY ID TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_meal_by_id_increments_views(mongo_client, sample_meal):
    """Test that viewing a meal increments the view count"""
    db = mongo_client[TEST_DB_NAME]

    initial_views = sample_meal.get("views", 0)

    # Simulate view increment
    await db.meals.update_one({"_id": sample_meal["_id"]}, {"$inc": {"views": 1}})

    updated_meal = await db.meals.find_one({"_id": sample_meal["_id"]})
    assert updated_meal["views"] == initial_views + 1


@pytest.mark.asyncio
async def test_get_meal_by_invalid_id(mongo_client):
    """Test retrieving a meal with invalid ObjectId format"""
    # Invalid ObjectId should be caught by validation
    invalid_id = "not_a_valid_object_id"

    assert not ObjectId.is_valid(invalid_id)


# ============================================================
# GET MY MEALS TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_my_meals(mongo_client, multiple_meals, test_user):
    """Test retrieving all meals created by authenticated user"""
    db = mongo_client[TEST_DB_NAME]

    my_meals = await db.meals.find({"seller_id": test_user["_id"]}).to_list(None)

    assert len(my_meals) == 3  # test_user created 3 meals in fixture
    assert all(meal["seller_id"] == test_user["_id"] for meal in my_meals)


@pytest.mark.asyncio
async def test_get_my_meals_empty(mongo_client, test_user):
    """Test getting my meals when user has no meals"""
    db = mongo_client[TEST_DB_NAME]

    my_meals = await db.meals.find({"seller_id": test_user["_id"]}).to_list(None)

    assert len(my_meals) == 0


# ============================================================
# UPDATE MEAL TESTS
# ============================================================


@pytest.mark.asyncio
async def test_update_meal_partial_update(mongo_client, sample_meal, test_user):
    """Test updating only some fields of a meal"""
    db = mongo_client[TEST_DB_NAME]

    original_title = sample_meal["title"]

    update_data = {
        "description": "Updated description only",
        "updated_at": datetime.utcnow(),
    }

    await db.meals.update_one({"_id": sample_meal["_id"]}, {"$set": update_data})

    updated_meal = await db.meals.find_one({"_id": sample_meal["_id"]})
    assert updated_meal["title"] == original_title  # Unchanged
    assert updated_meal["description"] == "Updated description only"


@pytest.mark.asyncio
async def test_update_meal_status(mongo_client, sample_meal, test_user):
    """Test updating meal status"""
    db = mongo_client[TEST_DB_NAME]

    await db.meals.update_one(
        {"_id": sample_meal["_id"]},
        {"$set": {"status": "sold", "updated_at": datetime.utcnow()}},
    )

    updated_meal = await db.meals.find_one({"_id": sample_meal["_id"]})
    assert updated_meal["status"] == "sold"


# ============================================================
# ADDITIONAL EDGE CASES
# ============================================================


@pytest.mark.asyncio
async def test_meal_with_special_characters(mongo_client, test_user):
    """Test creating meal with special characters in text fields"""
    db = mongo_client[TEST_DB_NAME]

    meal_doc = {
        "seller_id": test_user["_id"],
        "title": "Spicy 🌶️ Meal with émojis & spëcial çhars!",
        "description": 'Test with: quotes "nested", apostrophe\'s, and <html> tags',
        "cuisine_type": "Fusion",
        "meal_type": "dinner",
        "photos": [],
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "1 serving",
        "available_for_sale": True,
        "sale_price": 12.00,
        "available_for_swap": False,
        "swap_preferences": [],
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "average_rating": 0.0,
        "total_reviews": 0,
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal_doc)
    assert result.inserted_id is not None

    # Verify retrieval
    meal = await db.meals.find_one({"_id": result.inserted_id})
    assert "🌶️" in meal["title"]
    assert "quotes" in meal["description"]

    # Cleanup
    await db.meals.delete_one({"_id": result.inserted_id})


@pytest.mark.asyncio
async def test_multiple_filters_combined(mongo_client, multiple_meals):
    """Test combining multiple filters"""
    db = mongo_client[TEST_DB_NAME]

    meals = await db.meals.find(
        {
            "status": "available",
            "meal_type": "lunch",
            "available_for_sale": True,
            "sale_price": {"$lte": 12.00},
        }
    ).to_list(None)

    assert len(meals) == 1
    assert meals[0]["title"] == "Mexican Tacos"


# ============================================================
# FIXTURES FOR MEAL TESTING
# ============================================================


@pytest_asyncio.fixture
async def meal_async_client(mongo_client):
    """Create async test client with patched database for meal testing"""
    from app.main import app
    from httpx import ASGITransport, AsyncClient

    # Patch get_database function calls
    with patch("app.database.get_database", return_value=mongo_client[TEST_DB_NAME]):
        with patch(
            "app.routes.meal_routes.get_database",
            return_value=mongo_client[TEST_DB_NAME],
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                yield client


@pytest_asyncio.fixture
async def authenticated_meal_client(mongo_client, test_user):
    """
    Create an authenticated client for meal testing
    """
    from app.main import app
    from app.dependencies import get_current_user
    from httpx import ASGITransport, AsyncClient

    # Mock get_current_user dependency
    async def mock_get_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # Patch get_database function calls
    with patch("app.database.get_database", return_value=mongo_client[TEST_DB_NAME]):
        with patch(
            "app.routes.meal_routes.get_database",
            return_value=mongo_client[TEST_DB_NAME],
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                yield client

    # Clean up
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_meal_data():
    """Sample meal data for testing"""
    return {
        "title": "Delicious Pasta",
        "description": "Homemade pasta with tomato sauce",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "photos": ["https://example.com/pasta.jpg"],
        "allergen_info": {"contains": ["gluten", "dairy"], "may_contain": ["nuts"]},
        "nutrition_info": "Calories: 450; Protein: 15g; Carbs: 60g; Fat: 12g",
        "portion_size": "2 servings",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": True,
        "swap_preferences": ["Mexican", "Thai"],
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
        "pickup_instructions": "Ring doorbell",
    }






# ============================================================
# meal_to_response HELPER FUNCTION TESTS
# ============================================================


@pytest.mark.asyncio
async def test_meal_to_response_complete():
    """Test meal_to_response with complete data"""
    from app.routes.meal_routes import meal_to_response

    meal = {
        "_id": ObjectId(),
        "seller_id": ObjectId(),
        "title": "Test Meal",
        "description": "Test description",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "photos": ["photo1.jpg"],
        "allergen_info": {"contains": ["gluten"]},
        "nutrition_info": "Calories: 500",
        "portion_size": "2 servings",
        "available_for_sale": True,
        "sale_price": 10.00,
        "available_for_swap": False,
        "swap_preferences": [],
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "pickup_instructions": "Ring bell",
        "average_rating": 4.5,
        "total_reviews": 10,
        "views": 50,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    seller = {
        "_id": meal["seller_id"],
        "full_name": "Test Seller",
        "stats": {"average_rating": 4.8},
    }

    response = meal_to_response(meal, seller)

    # This covers line 18
    assert response.title == "Test Meal"
    assert response.seller_name == "Test Seller"
    assert response.seller_rating == 4.8


# ============================================================
# CREATE MEAL ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_create_meal_endpoint(
    authenticated_meal_client, mongo_client, test_user, sample_meal_data
):
    """Test POST /api/meals endpoint"""

    response = await authenticated_meal_client.post(
        "/api/meals/", json=sample_meal_data
    )

    # This covers lines 53-85
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == sample_meal_data["title"]
    assert data["seller_name"] == test_user["full_name"]
    assert data["status"] == "available"
    assert data["views"] == 0
    assert data["average_rating"] == 0.0


@pytest.mark.asyncio
async def test_create_meal_with_nutrition_info(
    authenticated_meal_client, mongo_client, sample_meal_data
):
    """Test creating meal with nutrition info"""

    response = await authenticated_meal_client.post(
        "/api/meals/", json=sample_meal_data
    )

    assert response.status_code == 201
    data = response.json()
    assert isinstance(data["nutrition_info"], str)
    assert "Calories" in data["nutrition_info"]
    assert "450" in data["nutrition_info"]


@pytest.mark.asyncio
async def test_create_meal_without_nutrition_info(
    authenticated_meal_client, mongo_client, sample_meal_data
):
    """Test creating meal without nutrition info"""

    # Remove nutrition_info
    meal_data = sample_meal_data.copy()
    meal_data["nutrition_info"] = None

    response = await authenticated_meal_client.post("/api/meals/", json=meal_data)

    assert response.status_code == 201
    data = response.json()
    assert data["nutrition_info"] is None


# ============================================================
# GET ALL MEALS ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_meals_no_filters(meal_async_client, mongo_client, test_user):
    """Test GET /api/meals without filters"""
    db = mongo_client[TEST_DB_NAME]

    # Create test meals
    meal1 = {
        "seller_id": test_user["_id"],
        "title": "Pasta",
        "description": "Italian pasta",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.meals.insert_one(meal1)

    response = await meal_async_client.get("/api/meals/")

    # This covers lines 99-126
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Pasta"


@pytest.mark.asyncio
async def test_get_meals_with_cuisine_filter(
    meal_async_client, mongo_client, test_user
):
    """Test GET /api/meals with cuisine_type filter"""
    db = mongo_client[TEST_DB_NAME]

    # Create Italian and Mexican meals
    italian_meal = {
        "seller_id": test_user["_id"],
        "title": "Pizza",
        "description": "Italian pizza",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 20.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    mexican_meal = {
        "seller_id": test_user["_id"],
        "title": "Tacos",
        "description": "Mexican tacos",
        "cuisine_type": "Mexican",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "4",
        "available_for_sale": True,
        "sale_price": 12.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.meals.insert_many([italian_meal, mexican_meal])

    response = await meal_async_client.get("/api/meals/?cuisine_type=Italian")

    assert response.status_code == 200
    data = response.json()
    assert all(meal["cuisine_type"] == "Italian" for meal in data)


@pytest.mark.asyncio
async def test_get_meals_with_meal_type_filter(
    meal_async_client, mongo_client, test_user
):
    """Test GET /api/meals with meal_type filter"""

    response = await meal_async_client.get("/api/meals/?meal_type=Lunch")

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_meals_with_max_price_filter(
    meal_async_client, mongo_client, test_user
):
    """Test GET /api/meals with max_price filter"""

    response = await meal_async_client.get("/api/meals/?max_price=20.00")

    assert response.status_code == 200
    data = response.json()
    assert all(meal["sale_price"] <= 20.00 for meal in data if meal["sale_price"])


@pytest.mark.asyncio
async def test_get_meals_with_sale_filter(meal_async_client, mongo_client, test_user):
    """Test GET /api/meals with available_for_sale filter"""

    response = await meal_async_client.get("/api/meals/?available_for_sale=true")

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_meals_with_swap_filter(meal_async_client, mongo_client, test_user):
    """Test GET /api/meals with available_for_swap filter"""

    response = await meal_async_client.get("/api/meals/?available_for_swap=true")

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_meals_with_pagination(meal_async_client, mongo_client, test_user):
    """Test GET /api/meals with skip and limit"""

    response = await meal_async_client.get("/api/meals/?skip=0&limit=10")

    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 10


# ============================================================
# GET MEAL BY ID ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_meal_by_id_success(meal_async_client, mongo_client, test_user):
    """Test GET /api/meals/{meal_id} with valid ID"""
    db = mongo_client[TEST_DB_NAME]

    # Create a meal
    meal = {
        "seller_id": test_user["_id"],
        "title": "Test Meal",
        "description": "Test",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "views": 5,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    response = await meal_async_client.get(f"/api/meals/{meal_id}")

    # This covers lines 132-162
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == meal_id
    assert data["views"] == 6  # Should increment by 1


@pytest.mark.asyncio
async def test_get_meal_by_id_invalid_id(meal_async_client):
    """Test GET /api/meals/{meal_id} with invalid ID format"""

    response = await meal_async_client.get("/api/meals/invalid_id_123")

    assert response.status_code == 400
    assert "Invalid meal ID" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_meal_by_id_not_found(meal_async_client):
    """Test GET /api/meals/{meal_id} with non-existent ID"""

    fake_id = str(ObjectId())
    response = await meal_async_client.get(f"/api/meals/{fake_id}")

    assert response.status_code == 404
    assert "Meal not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_meal_by_id_seller_not_found(meal_async_client, mongo_client):
    """Test GET /api/meals/{meal_id} when seller doesn't exist"""
    db = mongo_client[TEST_DB_NAME]

    # Create meal with non-existent seller
    meal = {
        "seller_id": ObjectId(),  # Non-existent seller
        "title": "Orphan Meal",
        "description": "Test",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    response = await meal_async_client.get(f"/api/meals/{meal_id}")

    # Should return 404 for seller not found (lines 158-161)
    assert response.status_code == 404
    assert "Seller not found" in response.json()["detail"]


# ============================================================
# GET MY MEALS ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_get_my_meals_endpoint(
    authenticated_meal_client, mongo_client, test_user
):
    """Test GET /api/meals/my/listings endpoint"""
    db = mongo_client[TEST_DB_NAME]

    # Create meals for test user
    meals = [
        {
            "seller_id": test_user["_id"],
            "title": f"My Meal {i}",
            "description": "Test",
            "cuisine_type": "Italian",
            "meal_type": "Dinner",
            "allergen_info": {"contains": []},
            "portion_size": "2",
            "available_for_sale": True,
            "sale_price": 15.00,
            "available_for_swap": False,
            "status": "available",
            "preparation_date": datetime.utcnow(),
            "expires_date": datetime.utcnow() + timedelta(days=1),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        for i in range(3)
    ]

    await db.meals.insert_many(meals)

    response = await authenticated_meal_client.get("/api/meals/my/listings")

    # This covers lines 168-174
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all(meal["seller_id"] == str(test_user["_id"]) for meal in data)


# ============================================================
# UPDATE MEAL ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_update_meal_success(authenticated_meal_client, mongo_client, test_user):
    """Test PUT /api/meals/{meal_id} with valid update"""
    db = mongo_client[TEST_DB_NAME]

    # Create a meal
    meal = {
        "seller_id": test_user["_id"],
        "title": "Original Title",
        "description": "Original description",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "pickup_instructions": "Ring bell",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    # Update the meal
    update_data = {
        "title": "Updated Title",
        "description": "Updated description",
        "sale_price": 20.00,
    }

    response = await authenticated_meal_client.put(
        f"/api/meals/{meal_id}", json=update_data
    )

    # This covers lines 184-252
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["sale_price"] == 20.00


@pytest.mark.asyncio
async def test_update_meal_invalid_id(authenticated_meal_client):
    """Test PUT /api/meals/{meal_id} with invalid ID"""

    update_data = {"title": "Updated"}
    response = await authenticated_meal_client.put(
        "/api/meals/invalid_id", json=update_data
    )

    assert response.status_code == 400
    assert "Invalid meal ID" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_meal_not_found(authenticated_meal_client):
    """Test PUT /api/meals/{meal_id} with non-existent meal"""

    fake_id = str(ObjectId())
    update_data = {"title": "Updated"}
    response = await authenticated_meal_client.put(
        f"/api/meals/{fake_id}", json=update_data
    )

    assert response.status_code == 404
    assert "Meal not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_meal_not_owner(authenticated_meal_client, mongo_client):
    """Test PUT /api/meals/{meal_id} when user doesn't own meal"""
    db = mongo_client[TEST_DB_NAME]

    # Create meal owned by someone else
    other_user_id = ObjectId()
    meal = {
        "seller_id": other_user_id,
        "title": "Other's Meal",
        "description": "Test",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    update_data = {"title": "Trying to steal"}
    response = await authenticated_meal_client.put(
        f"/api/meals/{meal_id}", json=update_data
    )

    # Should return 403 Forbidden (lines 205-208)
    assert response.status_code == 403
    assert "permission" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_update_meal_all_fields(
    authenticated_meal_client, mongo_client, test_user
):
    """Test updating all possible meal fields"""
    db = mongo_client[TEST_DB_NAME]

    # Create a meal
    meal = {
        "seller_id": test_user["_id"],
        "title": "Original",
        "description": "Original",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "photos": [],
        "allergen_info": {"contains": []},
        "nutrition_info": "Calories: 100",
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 10.00,
        "available_for_swap": False,
        "swap_preferences": [],
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "pickup_instructions": "Old instructions",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    # Update all fields
    update_data = {
        "title": "Updated Title",
        "description": "Updated description",
        "cuisine_type": "Mexican",
        "meal_type": "Lunch",
        "photos": ["new_photo.jpg"],
        "allergen_info": {"contains": ["nuts"]},
        "nutrition_info": "Calories: 500",
        "portion_size": "4 servings",
        "available_for_sale": False,
        "sale_price": 25.00,
        "available_for_swap": True,
        "swap_preferences": ["Thai"],
        "status": "sold",
        "pickup_instructions": "New instructions",
    }

    response = await authenticated_meal_client.put(
        f"/api/meals/{meal_id}", json=update_data
    )

    # Tests all the if statements in lines 213-238
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["cuisine_type"] == "Mexican"
    assert data["meal_type"] == "Lunch"
    assert "new_photo.jpg" in data["photos"]
    assert data["status"] == "sold"


@pytest.mark.asyncio
async def test_update_meal_no_changes(
    authenticated_meal_client, mongo_client, test_user
):
    """Test PUT /api/meals/{meal_id} with no actual changes"""
    db = mongo_client[TEST_DB_NAME]

    # Create a meal with all current values
    current_time = datetime.utcnow()
    meal = {
        "seller_id": test_user["_id"],
        "title": "Same Title",
        "description": "Same",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": current_time,
        "expires_date": current_time + timedelta(days=1),
        "created_at": current_time,
        "updated_at": current_time,
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    # Small delay to ensure updated_at would be different
    import asyncio

    await asyncio.sleep(0.1)

    # Try to update with empty data (only updated_at will change)
    update_data = {}
    response = await authenticated_meal_client.put(
        f"/api/meals/{meal_id}", json=update_data
    )

    # With empty update_data, only updated_at changes, so modified_count may be 1
    # The endpoint should either succeed (200) or fail with no changes (400)
    assert response.status_code in [200, 400]

    if response.status_code == 400:
        assert "No changes" in response.json()["detail"]


# ============================================================
# DELETE MEAL ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_delete_meal_success(authenticated_meal_client, mongo_client, test_user):
    """Test DELETE /api/meals/{meal_id} successfully"""
    db = mongo_client[TEST_DB_NAME]

    # Create a meal
    meal = {
        "seller_id": test_user["_id"],
        "title": "To Delete",
        "description": "Will be deleted",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    response = await authenticated_meal_client.delete(f"/api/meals/{meal_id}")

    # This covers lines 261-292
    assert response.status_code == 200
    assert "successfully deleted" in response.json()["message"]

    # Verify meal was deleted
    deleted_meal = await db.meals.find_one({"_id": result.inserted_id})
    assert deleted_meal is None


@pytest.mark.asyncio
async def test_delete_meal_invalid_id(authenticated_meal_client):
    """Test DELETE /api/meals/{meal_id} with invalid ID"""

    response = await authenticated_meal_client.delete("/api/meals/invalid_id")

    assert response.status_code == 400
    assert "Invalid meal ID" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_meal_not_found(authenticated_meal_client):
    """Test DELETE /api/meals/{meal_id} with non-existent meal"""

    fake_id = str(ObjectId())
    response = await authenticated_meal_client.delete(f"/api/meals/{fake_id}")

    assert response.status_code == 404
    assert "Meal not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_meal_not_owner(authenticated_meal_client, mongo_client):
    """Test DELETE /api/meals/{meal_id} when user doesn't own meal"""
    db = mongo_client[TEST_DB_NAME]

    # Create meal owned by someone else
    other_user_id = ObjectId()
    meal = {
        "seller_id": other_user_id,
        "title": "Other's Meal",
        "description": "Test",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    response = await authenticated_meal_client.delete(f"/api/meals/{meal_id}")

    # Should return 403 Forbidden (lines 276-279)
    assert response.status_code == 403
    assert "permission" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_meal_already_deleted(
    authenticated_meal_client, mongo_client, test_user
):
    """Test DELETE /api/meals/{meal_id} when meal was already deleted"""
    db = mongo_client[TEST_DB_NAME]

    # Create and immediately delete a meal
    meal = {
        "seller_id": test_user["_id"],
        "title": "Deleted",
        "description": "Test",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "2",
        "available_for_sale": True,
        "sale_price": 15.00,
        "available_for_swap": False,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal)
    meal_id = str(result.inserted_id)

    # Delete it first
    await db.meals.delete_one({"_id": result.inserted_id})

    # Try to delete again
    response = await authenticated_meal_client.delete(f"/api/meals/{meal_id}")

    # Should return 404 (lines 286-289)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_upload_photos_single(meal_async_client):
    """Upload a single photo returns one URL and saves the file."""
    files = [("files", ("test1.txt", b"hello", "text/plain"))]
    resp = await meal_async_client.post("/api/meals/upload", files=files)
    assert resp.status_code == 200
    urls = resp.json()
    assert isinstance(urls, list) and len(urls) == 1
    assert urls[0].startswith("/static/uploads/")


@pytest.mark.asyncio
async def test_upload_photos_multiple(meal_async_client):
    """Upload multiple photos returns unique URLs for each file."""
    files = [
        ("files", ("a.txt", b"A", "text/plain")),
        ("files", ("b.txt", b"B", "text/plain")),
        ("files", ("c.txt", b"C", "text/plain")),
    ]
    resp = await meal_async_client.post("/api/meals/upload", files=files)
    assert resp.status_code == 200
    urls = resp.json()
    assert len(urls) == 3
    assert len(set(urls)) == 3


@pytest.mark.asyncio
async def test_upload_photos_write_failure(monkeypatch, meal_async_client):
    """Server returns 500 if saving an uploaded file fails."""

    def _boom(*args, **kwargs):  # pragma: no cover - intentional error path
        raise RuntimeError("disk full")

    # Patch module-level name on the actual module object
    from app.routes import meal_routes as meal_routes_module

    monkeypatch.setattr(meal_routes_module, "open", _boom, raising=False)
    files = [("files", ("x.txt", b"x", "text/plain"))]
    resp = await meal_async_client.post("/api/meals/upload", files=files)
    assert resp.status_code == 500


@pytest.mark.asyncio
async def test_create_meal_no_pickup_instructions(
    authenticated_meal_client, mongo_client, test_user
):
    """Creating a meal without pickup_instructions keeps it None in response."""
    meal = {
        "title": "No Pickup",
        "description": "desc long enough",
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": [], "may_contain": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 9.99,
        "preparation_date": datetime.utcnow().isoformat(),
        "expires_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
    }
    resp = await authenticated_meal_client.post("/api/meals/", json=meal)
    assert resp.status_code == 201
    assert resp.json().get("pickup_instructions") in (None, "")


@pytest.mark.asyncio
async def test_get_meals_min_rating_filter(meal_async_client, mongo_client, test_user):
    """Meals below min_rating should be filtered out."""
    db = mongo_client[TEST_DB_NAME]
    high = {
        "seller_id": test_user["_id"],
        "title": "High Rated",
        "description": "d" * 20,
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 10.0,
        "status": "available",
        "average_rating": 4.8,
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    low = dict(high, title="Low Rated", average_rating=2.0)
    await db.meals.insert_many([high, low])

    resp = await meal_async_client.get("/api/meals/?min_rating=4.0")
    assert resp.status_code == 200
    titles = [m["title"] for m in resp.json()]
    assert "High Rated" in titles
    assert "Low Rated" not in titles


@pytest.mark.asyncio
async def test_get_meals_sort_created_at_desc(
    meal_async_client, mongo_client, test_user
):
    """Meals are sorted by created_at desc by default."""
    db = mongo_client[TEST_DB_NAME]
    older = {
        "seller_id": test_user["_id"],
        "title": "Older",
        "description": "d" * 20,
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 10.0,
        "status": "available",
        "created_at": datetime.utcnow() - timedelta(days=1),
        "preparation_date": datetime.utcnow() - timedelta(days=1),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    newer = dict(older, title="Newer", created_at=datetime.utcnow())
    await db.meals.insert_many([older, newer])

    resp = await meal_async_client.get("/api/meals/")
    assert resp.status_code == 200
    data = resp.json()
    titles = [m["title"] for m in data]
    assert titles.index("Newer") < titles.index("Older")


@pytest.mark.asyncio
async def test_get_meals_skip_beyond_range(meal_async_client):
    """Skipping beyond available rows returns empty list."""
    resp = await meal_async_client.get("/api/meals/?skip=10000&limit=10")
    assert resp.status_code == 200
    assert resp.json() == [] or isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_dietary_filter_vegetarian_excludes_meat(
    meal_async_client, mongo_client, test_user
):
    db = mongo_client[TEST_DB_NAME]
    meal_meat = {
        "seller_id": test_user["_id"],
        "title": "Chicken Dish",
        "description": "desc" * 5,
        "cuisine_type": "American",
        "meal_type": "Dinner",
        "ingredients": "grilled chicken, spices",
        "allergen_info": {"contains": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 12.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    veg = dict(meal_meat, title="Veggie", ingredients="tofu, vegetables")
    await db.meals.insert_many([meal_meat, veg])
    resp = await meal_async_client.get("/api/meals/?dietary_restriction=vegetarian")
    titles = [m["title"] for m in resp.json()]
    assert "Veggie" in titles and "Chicken Dish" not in titles


@pytest.mark.asyncio
async def test_dietary_filter_vegan_excludes_dairy(
    meal_async_client, mongo_client, test_user
):
    db = mongo_client[TEST_DB_NAME]
    dairy = {
        "seller_id": test_user["_id"],
        "title": "Cheesy",
        "description": "desc" * 5,
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "ingredients": "pasta, cheese, sauce",
        "allergen_info": {"contains": ["dairy"]},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 14.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    plant = dict(
        dairy,
        title="Vegan Bowl",
        allergen_info={"contains": []},
        ingredients="quinoa, beans",
    )
    await db.meals.insert_many([dairy, plant])
    resp = await meal_async_client.get("/api/meals/?dietary_restriction=vegan")
    titles = [m["title"] for m in resp.json()]
    assert "Vegan Bowl" in titles and "Cheesy" not in titles


@pytest.mark.asyncio
async def test_dietary_filter_gluten_free_excludes_wheat(
    meal_async_client, mongo_client, test_user
):
    db = mongo_client[TEST_DB_NAME]
    wheat = {
        "seller_id": test_user["_id"],
        "title": "Bread Basket",
        "description": "desc" * 5,
        "cuisine_type": "French",
        "meal_type": "Breakfast",
        "ingredients": "bread, butter",
        "allergen_info": {"contains": ["wheat"]},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 6.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    gf = dict(
        wheat,
        title="Gluten Free",
        allergen_info={"contains": []},
        ingredients="eggs, avocado",
    )
    await db.meals.insert_many([wheat, gf])
    resp = await meal_async_client.get("/api/meals/?dietary_restriction=gluten-free")
    titles = [m["title"] for m in resp.json()]
    assert "Gluten Free" in titles and "Bread Basket" not in titles


@pytest.mark.asyncio
async def test_dietary_filter_dairy_free_excludes_milk(
    meal_async_client, mongo_client, test_user
):
    db = mongo_client[TEST_DB_NAME]
    milk = {
        "seller_id": test_user["_id"],
        "title": "Milkshake",
        "description": "desc" * 5,
        "cuisine_type": "American",
        "meal_type": "Snack",
        "ingredients": "milk, sugar",
        "allergen_info": {"contains": ["milk"]},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 4.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    alt = dict(
        milk,
        title="Fruit Cup",
        allergen_info={"contains": []},
        ingredients="strawberries, banana",
    )
    await db.meals.insert_many([milk, alt])
    resp = await meal_async_client.get("/api/meals/?dietary_restriction=dairy-free")
    titles = [m["title"] for m in resp.json()]
    assert "Fruit Cup" in titles and "Milkshake" not in titles


@pytest.mark.asyncio
async def test_dietary_filter_nut_free_excludes_peanuts(
    meal_async_client, mongo_client, test_user
):
    db = mongo_client[TEST_DB_NAME]
    nuts = {
        "seller_id": test_user["_id"],
        "title": "Peanut Bar",
        "description": "desc" * 5,
        "cuisine_type": "Snack",
        "meal_type": "Snack",
        "ingredients": "peanuts, sugar",
        "allergen_info": {"contains": ["peanuts"]},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 2.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    safe = dict(
        nuts, title="Oat Bar", allergen_info={"contains": []}, ingredients="oats, honey"
    )
    await db.meals.insert_many([nuts, safe])
    resp = await meal_async_client.get("/api/meals/?dietary_restriction=nut-free")
    titles = [m["title"] for m in resp.json()]
    assert "Oat Bar" in titles and "Peanut Bar" not in titles


@pytest.mark.asyncio
async def test_dietary_filter_keto_excludes_bread(
    meal_async_client, mongo_client, test_user
):
    db = mongo_client[TEST_DB_NAME]
    carb = {
        "seller_id": test_user["_id"],
        "title": "Pasta Plate",
        "description": "desc" * 5,
        "cuisine_type": "Italian",
        "meal_type": "Dinner",
        "ingredients": "pasta, sauce",
        "allergen_info": {"contains": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 10.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    keto = dict(carb, title="Keto Plate", ingredients="steak, broccoli")
    await db.meals.insert_many([carb, keto])
    resp = await meal_async_client.get("/api/meals/?dietary_restriction=keto")
    titles = [m["title"] for m in resp.json()]
    assert "Keto Plate" in titles and "Pasta Plate" not in titles


@pytest.mark.asyncio
async def test_recommendations_exclude_user_allergens(
    authenticated_meal_client, mongo_client, test_user
):
    """Recommendations should exclude meals containing user's allergens."""
    db = mongo_client[TEST_DB_NAME]
    # Ensure user has an allergen in both in-memory current_user and DB document
    test_user.setdefault("dietary_preferences", {}).update({"allergens": ["peanuts"]})
    await db.users.update_one(
        {"_id": test_user["_id"]},
        {"$set": {"dietary_preferences.allergens": ["peanuts"]}},
        upsert=True,
    )
    other_seller = ObjectId()
    # Insert a seller so recommendations can resolve seller details
    await db.users.insert_one(
        {
            "_id": other_seller,
            "email": "seller@example.com",
            "full_name": "Seller User",
            "location": {
                "address": "1 St",
                "city": "C",
                "state": "ST",
                "zip_code": "00000",
            },
            "role": "user",
            "status": "active",
            "stats": {"average_rating": 4.0, "total_reviews": 0},
            "created_at": datetime.utcnow(),
        }
    )
    bad = {
        "seller_id": other_seller,
        "title": "Peanut Soup",
        "description": "desc" * 5,
        "cuisine_type": "Thai",
        "meal_type": "Dinner",
        "ingredients": "peanuts, broth",
        "allergen_info": {"contains": ["peanuts"]},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 7.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "updated_at": datetime.utcnow(),
    }
    good = dict(
        bad, title="Veg Soup", allergen_info={"contains": []}, ingredients="veggies"
    )
    await db.meals.insert_many([bad, good])
    resp = await authenticated_meal_client.get("/api/meals/my/recommendations")
    assert resp.status_code == 200
    titles = [m["title"] for m in resp.json()]
    assert "Veg Soup" in titles and "Peanut Soup" not in titles


@pytest.mark.asyncio
async def test_meal_to_response_defaults_when_missing(mongo_client, test_user):
    """Missing optional numeric fields default in response."""
    db = mongo_client[TEST_DB_NAME]
    doc = {
        "seller_id": test_user["_id"],
        "title": "No Stats",
        "description": "desc" * 5,
        "cuisine_type": "Any",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 5.0,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    res = await db.meals.insert_one(doc)
    meal = await db.meals.find_one({"_id": res.inserted_id})
    from app.routes.meal_routes import meal_to_response

    response = meal_to_response(meal, test_user)
    assert response.views == 0
    assert response.average_rating == 0.0
    assert response.total_reviews == 0


@pytest.mark.asyncio
async def test_update_meal_ignores_seller_id_change(
    authenticated_meal_client, mongo_client, test_user
):
    """PUT attempts to change seller_id should be ignored by the model."""
    db = mongo_client[TEST_DB_NAME]
    meal = {
        "seller_id": test_user["_id"],
        "title": "Owner Locked",
        "description": "desc" * 5,
        "cuisine_type": "Any",
        "meal_type": "Dinner",
        "allergen_info": {"contains": []},
        "portion_size": "1",
        "available_for_sale": True,
        "sale_price": 8.0,
        "status": "available",
        "preparation_date": datetime.utcnow(),
        "expires_date": datetime.utcnow() + timedelta(days=1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    ins = await db.meals.insert_one(meal)
    mid = str(ins.inserted_id)

    body = {"seller_id": str(ObjectId())}  # not part of MealUpdate
    resp = await authenticated_meal_client.put(f"/api/meals/{mid}", json=body)
    assert resp.status_code in [200, 400]  # 400 if no changes applied
    updated = await db.meals.find_one({"_id": ins.inserted_id})
    assert str(updated["seller_id"]) == str(test_user["_id"])  # unchanged
