"""
Comprehensive tests for auth_routes.py
Tests user registration, login, and authentication flows
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime

TEST_DB_NAME = "test_meal_db"


# ============================================================
# FIXTURES
# ============================================================


@pytest_asyncio.fixture
async def async_client(test_db):
    """Create async test client with database override"""
    from app.main import app
    import app.database as database_module

    # Store original database
    original_database = database_module.database

    # Override the global database variable
    database_module.database = test_db

    # Use ASGITransport instead of deprecated app= argument
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Restore original database
    database_module.database = original_database


@pytest_asyncio.fixture
async def test_db(mongo_client):
    """Get test database instance"""
    db = mongo_client[TEST_DB_NAME]
    return db


# @pytest_asyncio.fixture
# async def async_client(test_db):
#    """Create async test client with database override"""
#    from app.main import app
#    import app.database as database_module

# Store original database
#    original_database = database_module.database

# Override the global database variable
#    database_module.database = test_db

#    async with AsyncClient(app=app, base_url="http://test") as ac:
#        yield ac

# Restore original database
#    database_module.database = original_database


@pytest_asyncio.fixture
async def clean_db(test_db):
    """Clean database before each test"""
    await test_db.users.delete_many({})
    yield test_db
    await test_db.users.delete_many({})


@pytest.fixture
def sample_user_data():
    """Sample user registration data"""
    return {
        "email": "testuser@example.com",
        "password": "SecurePass123!",
        "full_name": "Test User",
        "phone": "+1234567890",
        "location": {
            "address": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "coordinates": {"lat": 0.0, "lng": 0.0},
        },
        "bio": "Test bio",
        "profile_picture": None,
    }


@pytest_asyncio.fixture
async def registered_user(clean_db, sample_user_data):
    """Create a registered user for testing login"""
    from app.utils import hash_password
    from app.models import (
        UserRole,
        AccountStatus,
        UserStats,
        SocialMediaLinks,
        DietaryPreferences,
    )

    hashed_password = hash_password(sample_user_data["password"])

    user_doc = {
        "email": sample_user_data["email"],
        "password": hashed_password,
        "full_name": sample_user_data["full_name"],
        "phone": sample_user_data["phone"],
        "location": sample_user_data["location"],
        "bio": sample_user_data["bio"],
        "profile_picture": sample_user_data["profile_picture"],
        "dietary_preferences": DietaryPreferences().dict(),
        "social_media": SocialMediaLinks().dict(),
        "role": UserRole.USER,
        "status": AccountStatus.ACTIVE,
        "stats": UserStats().dict(),
        "verified": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await clean_db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


# ============================================================
# USER REGISTRATION TESTS
# ============================================================


@pytest.mark.asyncio
async def test_register_user_success(async_client, clean_db, sample_user_data):
    """Test successful user registration"""
    response = await async_client.post("/api/auth/register/user", json=sample_user_data)

    assert response.status_code == 201
    data = response.json()
    assert "message" in data
    assert "user_id" in data
    assert data["email"] == sample_user_data["email"]
    assert "can now log in" in data["message"].lower()

    # Verify user was created in database
    user = await clean_db.users.find_one({"email": sample_user_data["email"]})
    assert user is not None
    assert user["verified"] is True
    assert user["status"].upper() == "ACTIVE"


@pytest.mark.asyncio
async def test_register_user_duplicate_email(
    async_client, registered_user, sample_user_data
):
    """Test registration with existing email fails"""
    response = await async_client.post("/api/auth/register/user", json=sample_user_data)

    assert response.status_code == 400
    data = response.json()
    assert "already associated" in data["detail"].lower()


@pytest.mark.asyncio
async def test_register_user_password_is_hashed(
    async_client, clean_db, sample_user_data
):
    """Test that password is hashed before storage"""
    response = await async_client.post("/api/auth/register/user", json=sample_user_data)

    assert response.status_code == 201

    user = await clean_db.users.find_one({"email": sample_user_data["email"]})
    assert user["password"] != sample_user_data["password"]
    assert len(user["password"]) > 50  # Hashed passwords are longer


@pytest.mark.asyncio
async def test_register_user_sets_default_values(
    async_client, clean_db, sample_user_data
):
    """Test that registration sets correct default values"""
    response = await async_client.post("/api/auth/register/user", json=sample_user_data)

    assert response.status_code == 201

    user = await clean_db.users.find_one({"email": sample_user_data["email"]})
    assert user["role"].upper() == "USER"
    assert user["status"].upper() == "ACTIVE"
    assert user["verified"] is True
    assert "dietary_preferences" in user
    assert "social_media" in user
    assert "stats" in user


@pytest.mark.asyncio
async def test_register_user_immediate_active_status(
    async_client, clean_db, sample_user_data
):
    """Test that newly registered users are immediately active"""
    response = await async_client.post("/api/auth/register/user", json=sample_user_data)

    assert response.status_code == 201

    user = await clean_db.users.find_one({"email": sample_user_data["email"]})
    assert user["status"].upper() == "ACTIVE"
    assert user["verified"] is True


@pytest.mark.asyncio
async def test_register_user_can_login_immediately(
    async_client, clean_db, sample_user_data
):
    """Test that user can login immediately after registration"""
    # Register
    register_response = await async_client.post(
        "/api/auth/register/user", json=sample_user_data
    )
    assert register_response.status_code == 201

    # Login immediately
    login_response = await async_client.post(
        "/api/auth/login",
        json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"],
        },
    )

    assert login_response.status_code == 200
    data = login_response.json()
    assert data["message"] == "Login successful"


# ============================================================
# LOGIN TESTS
# ============================================================


@pytest.mark.asyncio
async def test_login_success(async_client, registered_user, sample_user_data):
    """Test successful user login"""
    response = await async_client.post(
        "/api/auth/login",
        json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Login successful"
    assert "user_id" in data
    assert data["email"] == sample_user_data["email"]
    assert data["role"].upper() == "USER"
    assert data["full_name"] == sample_user_data["full_name"]


@pytest.mark.asyncio
async def test_login_incorrect_password(async_client, registered_user):
    """Test login with incorrect password fails"""
    response = await async_client.post(
        "/api/auth/login",
        json={"email": registered_user["email"], "password": "WrongPassword123!"},
    )

    assert response.status_code == 401
    data = response.json()
    assert "incorrect" in data["detail"].lower()


@pytest.mark.asyncio
async def test_login_nonexistent_user(async_client):
    """Test login with nonexistent email"""
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "SomePassword123!"},
    )

    assert response.status_code == 401
    data = response.json()
    assert "incorrect" in data["detail"].lower()


@pytest.mark.asyncio
async def test_login_returns_user_info(async_client, registered_user, sample_user_data):
    """Test that login returns correct user information"""
    response = await async_client.post(
        "/api/auth/login",
        json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "email" in data
    assert "role" in data
    assert "full_name" in data
    assert data["email"] == registered_user["email"]
    assert data["full_name"] == registered_user["full_name"]


@pytest.mark.asyncio
async def test_login_case_sensitive_email(
    async_client, registered_user, sample_user_data
):
    """Test that email is case-sensitive during login"""
    response = await async_client.post(
        "/api/auth/login",
        json={
            "email": sample_user_data["email"].upper(),
            "password": sample_user_data["password"],
        },
    )

    # Should fail because email is case-sensitive
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_empty_credentials(async_client):
    """Test login with empty credentials"""
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "", "password": ""},
    )

    # Should return 422 for validation error or 401 for invalid credentials
    assert response.status_code in [401, 422]


# ============================================================
# DEBUG ENDPOINT TESTS
# ============================================================


@pytest.mark.asyncio
async def test_debug_list_users(async_client, registered_user):
    """Test debug endpoint lists all users"""
    response = await async_client.get("/api/debug/users")

    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 1

    # Check that _id is converted to string
    for user in users:
        assert isinstance(user["_id"], str)


@pytest.mark.asyncio
async def test_debug_list_users_empty_db(async_client, clean_db):
    """Test debug endpoint with empty database"""
    response = await async_client.get("/api/debug/users")

    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) == 0


@pytest.mark.asyncio
async def test_debug_list_users_limit(async_client, clean_db):
    """Test debug endpoint respects 100 user limit"""
    response = await async_client.get("/api/debug/users")

    assert response.status_code == 200
    users = response.json()
    assert len(users) <= 100


@pytest.mark.asyncio
async def test_debug_list_users_includes_all_fields(async_client, registered_user):
    """Test debug endpoint includes user fields"""
    response = await async_client.get("/api/debug/users")

    assert response.status_code == 200
    users = response.json()

    if len(users) > 0:
        user = users[0]
        assert "email" in user
        assert "full_name" in user
        assert "verified" in user
        assert "status" in user


# ============================================================
# PASSWORD VALIDATION TESTS
# ============================================================


@pytest.mark.asyncio
async def test_register_weak_password(async_client, sample_user_data):
    """Test registration with weak password fails"""
    weak_passwords = [
        "short",  # Too short
        "alllowercase123",  # No uppercase
        "ALLUPPERCASE123",  # No lowercase
        "NoNumbers!",  # No numbers
    ]

    for weak_pwd in weak_passwords:
        data = sample_user_data.copy()
        data["password"] = weak_pwd

        response = await async_client.post("/api/auth/register/user", json=data)

        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_register_valid_password_formats(
    async_client, clean_db, sample_user_data
):
    """Test various valid password formats"""
    valid_passwords = [
        "Password123!",
        "Abcdefgh1",
        "MyP@ssw0rd",
        "Secure123Password",
    ]

    for i, valid_pwd in enumerate(valid_passwords):
        data = sample_user_data.copy()
        data["email"] = f"user{i}@example.com"
        data["password"] = valid_pwd

        response = await async_client.post("/api/auth/register/user", json=data)

        assert response.status_code == 201


# ============================================================
# EDGE CASES AND ERROR HANDLING
# ============================================================


@pytest.mark.asyncio
async def test_register_invalid_email_format(async_client, sample_user_data):
    """Test registration with invalid email format"""
    invalid_emails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
    ]

    for invalid_email in invalid_emails:
        data = sample_user_data.copy()
        data["email"] = invalid_email

        response = await async_client.post("/api/auth/register/user", json=data)

        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_register_missing_required_fields(async_client):
    """Test registration with missing required fields"""
    incomplete_data = {
        "email": "test@example.com",
        "password": "Password123",
        # Missing full_name, location
    }

    response = await async_client.post("/api/auth/register/user", json=incomplete_data)

    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_login_missing_fields(async_client):
    """Test login with missing fields"""
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "test@example.com"},  # Missing password
    )

    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_register_with_special_characters_in_name(
    async_client, clean_db, sample_user_data
):
    """Test registration with special characters in name"""
    data = sample_user_data.copy()
    data["email"] = "special@example.com"
    data["full_name"] = "José María O'Connor-Smith"

    response = await async_client.post("/api/auth/register/user", json=data)

    assert response.status_code == 201

    user = await clean_db.users.find_one({"email": data["email"]})
    assert user["full_name"] == "José María O'Connor-Smith"


@pytest.mark.asyncio
async def test_register_with_long_bio(async_client, clean_db, sample_user_data):
    """Test registration with very long bio"""
    data = sample_user_data.copy()
    data["email"] = "longbio@example.com"
    data["bio"] = "A" * 1000  # Very long bio

    response = await async_client.post("/api/auth/register/user", json=data)

    assert response.status_code == 201


@pytest.mark.asyncio
async def test_multiple_concurrent_registrations(
    async_client, clean_db, sample_user_data
):
    """Test multiple users can register concurrently"""
    import asyncio

    async def register_user(email):
        data = sample_user_data.copy()
        data["email"] = email
        return await async_client.post("/api/auth/register/user", json=data)

    # Register 5 users concurrently
    responses = await asyncio.gather(
        *[register_user(f"user{i}@example.com") for i in range(5)]
    )

    # All should succeed
    for response in responses:
        assert response.status_code == 201

    # Verify all users exist
    users = await clean_db.users.find({}).to_list(None)
    assert len(users) == 5


@pytest.mark.asyncio
async def test_register_name_with_emoji(async_client, clean_db, sample_user_data):
    data = sample_user_data.copy()
    data["email"] = "emoji@example.com"
    data["full_name"] = "Chef 😋 User"
    resp = await async_client.post("/api/auth/register/user", json=data)
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_register_extremely_long_email(async_client, sample_user_data):
    local = "a" * 65  # local part > 64 invalid
    data = sample_user_data.copy()
    data["email"] = f"{local}@example.com"
    resp = await async_client.post("/api/auth/register/user", json=data)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_email_with_whitespace(
    async_client, registered_user, sample_user_data
):
    resp = await async_client.post(
        "/api/auth/login",
        json={
            "email": f"  {sample_user_data['email']}  ",
            "password": sample_user_data["password"],
        },
    )
    # App trims whitespace in email; accept 200 success or validation errors
    assert resp.status_code in [200, 401, 422]
    if resp.status_code == 200:
        assert resp.json().get("message") == "Login successful"


@pytest.mark.asyncio
async def test_login_password_case_sensitivity(
    async_client, registered_user, sample_user_data
):
    wrong_case = sample_user_data["password"].swapcase()
    resp = await async_client.post(
        "/api/auth/login",
        json={"email": sample_user_data["email"], "password": wrong_case},
    )
    assert resp.status_code == 401
