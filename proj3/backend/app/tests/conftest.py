"""
Pytest configuration and shared fixtures for meal API tests.
Place this file in your tests/ directory as: app/tests/conftest.py
"""

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
import os
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
import sys


# Test MongoDB configuration
# Use the production MongoDB Atlas URL with a separate test database
TEST_MONGO_URL = os.environ.get("TEST_MONGO_URL", "mongodb+srv://yashbmv_db_user:Ecobites1234@cluster0.x6pmmrs.mongodb.net/?appName=Cluster0")
TEST_DB_NAME = os.environ.get("TEST_DB_NAME", "test_meal_db")


print(f"\n{'='*60}", file=sys.stderr, flush=True)
print(f"[TEST CONFIG] Using MongoDB URL: {TEST_MONGO_URL}", file=sys.stderr, flush=True)
print(f"[TEST CONFIG] Database: {TEST_DB_NAME}", file=sys.stderr, flush=True)
print(f"{'='*60}\n", file=sys.stderr, flush=True)


# Use function scope for mongo_client to avoid event loop issues
@pytest_asyncio.fixture(scope="function")
async def mongo_client():
    """
    Create a MongoDB client for each test function.
    This ensures each test uses the correct event loop.
    """
    client = AsyncIOMotorClient(TEST_MONGO_URL, serverSelectionTimeoutMS=5000)

    # Verify connection
    try:
        await client.admin.command("ping")
    except Exception as e:
        pytest.fail(f"Failed to connect to test MongoDB at {TEST_MONGO_URL}: {e}")

    yield client

    # Cleanup
    client.close()


def pytest_configure(config):
    """
    Pytest hook for initial configuration.
    """
    config.addinivalue_line("markers", "integration: mark test as an integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")


@pytest.fixture
def test_client():
    """Create FastAPI test client"""
    from app.main import app

    return TestClient(app)


@pytest_asyncio.fixture
async def async_client(mongo_client):
    """Create async test client for API testing"""
    from app.main import app

    # Patch get_database to return test database
    with patch("app.database.get_database", return_value=mongo_client["test_meal_db"]):
        with patch(
            "app.routes.user_routes.get_database",
            return_value=mongo_client["test_meal_db"],
        ):
            # httpx 0.24+ requires ASGITransport
            transport = ASGITransport(app=app)

            async with AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                yield client


@pytest.fixture
def sync_client(mongo_client):
    """Create synchronous test client"""
    from app.main import app
    from starlette.testclient import TestClient

    # Patch get_database to return test database
    with patch("app.database.get_database", return_value=mongo_client["test_meal_db"]):
        with patch(
            "app.routes.user_routes.get_database",
            return_value=mongo_client["test_meal_db"],
        ):
            client = TestClient(app)
            yield client
            client.close()


@pytest_asyncio.fixture
async def authenticated_client(mongo_client, test_user):
    """
    Create an authenticated client with mocked database and authentication
    """
    from app.main import app
    from app.dependencies import get_current_user
    from httpx import ASGITransport, AsyncClient

    # Mock get_current_user dependency
    async def mock_get_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # Patch get_database function calls
    with patch("app.database.get_database", return_value=mongo_client["test_meal_db"]):
        with patch(
            "app.routes.user_routes.get_database",
            return_value=mongo_client["test_meal_db"],
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                yield client

    # Clean up
    app.dependency_overrides.clear()


# Add this fixture to clean database before each test
@pytest_asyncio.fixture(autouse=True, scope="function")
async def clean_test_database(mongo_client):
    """Clean all test collections before and after each test"""
    db = mongo_client["test_meal_db"]

    # Clean before test
    await db.meals.delete_many({})
    await db.users.delete_many({})
    await db.reviews.delete_many({})
    await db.verification_tokens.delete_many({})

    yield

    # Clean after test
    await db.meals.delete_many({})
    await db.users.delete_many({})
    await db.reviews.delete_many({})
    await db.verification_tokens.delete_many({})
