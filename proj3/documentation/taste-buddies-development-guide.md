# Taste Buddies - Development Guide

**Version:** 1.0.0

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Local Development Setup](#local-development-setup)
3. [Code Quality](#code-quality)
4. [Database Management](#database-management)
5. [Adding New Inupts](#adding-new-endpoints)
6. [Environment Variables](#environment-variables)
7. [Docker Commands Reference](#docker-commands-reference)
8. [API Libraries & SDK's](#api-libraries--sdks)
8. [Data Models Reference](#data-models-reference)
9. [Security Best Practices](#security-best-practices)
10. [Performance Optimization](#performance-optimization)
11. [Testing Guide](#testing-guide)
12. [Deployment to Production](#deployment-to-production)
13. [API Versioning](#api-versioning)
14. [ Support](#support)


---

### Project Structure

```
proj2/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # Pydantic models and schemas
│   ├── database.py          # MongoDB connection management
│   ├── dependencies.py      # Authentication dependencies
│   ├── utils.py            # Utility functions (hashing, tokens)
│   └── routes/
│       ├── auth_routes.py   # Authentication endpoints
│       ├── user_routes.py   # User management endpoints
│       └── meal_routes.py   # Meal management endpoints
├── tests/                   # Test files
├── Dockerfile              # Backend container configuration
├── docker-compose.yml      # Multi-container orchestration
└── requirements.txt        # Python dependencies
```

### Local Development Setup

#### Without Docker

1. **Install Python 3.11+**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally
   ```

4. **Set environment variables:**
   ```bash
   export MONGODB_URL=mongodb://localhost:27017
   export DATABASE_NAME=tastebuddies
   ```

5. **Run the application:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Running Tests Locally

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py -v
```

### Code Quality

#### Linting

```bash
# Install flake8
pip install flake8

# Run linter
flake8 app/

# Run with specific rules
flake8 app/ --max-line-length=100
```

#### Code Coverage

View coverage report after running tests:
```bash
pytest --cov=app --cov-report=html tests/
# Open htmlcov/index.html in browser
```

### Database Management

#### Accessing MongoDB Shell

```bash
# Enter MongoDB container
docker exec -it <mongodb-container-name> mongosh

# Use database
use tastebuddies

# View collections
show collections

# Query users
db.users.find().pretty()

# Query meals
db.meals.find({status: "available"}).pretty()
```

#### Database Indexes

Indexes are automatically created on startup:

**Users Collection:**
- `email` (unique)

**Meals Collection:**
- `seller_id`
- `status`
- `cuisine_type`
- `created_at`

**Reviews Collection:**
- `meal_id`
- `reviewer_id`
- `seller_id`

**Verification Tokens Collection:**
- `expires_at` (TTL index)
- `email`

### Adding New Endpoints

1. **Define Pydantic models** in `models.py`
2. **Create route handler** in appropriate route file
3. **Add authentication** if needed using `Depends(get_current_user)`
4. **Write tests** for the endpoint
5. **Update this documentation**

Example:
```python
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/example", tags=["Example"])

@router.get("/")
async def get_example(current_user: dict = Depends(get_current_user)):
    return {"message": "Hello, authenticated user!"}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URL` | `mongodb://mongodb:27017` | MongoDB connection string |
| `DATABASE_NAME` | `myapp` | Database name |

### Docker Commands Reference

```bash
# Build without cache
docker-compose build --no-cache

# View container resource usage
docker stats

# Execute command in container
docker-compose exec backend bash

# View container details
docker inspect <container-name>

# Remove all stopped containers
docker-compose rm

# Scale a service (if applicable)
docker-compose up --scale backend=3
```

---

## API Libraries & SDKs

### Python Client Example

```python
import requests

BASE_URL = "http://localhost:8000"

# Register user
response = requests.post(f"{BASE_URL}/api/auth/register/user", json={
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe",
    "location": {
        "address": "123 Main St",
        "city": "Raleigh",
        "state": "NC",
        "zip_code": "27601"
    }
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "user@example.com",
    "password": "SecurePass123"
})
user_data = response.json()

# Use token for authenticated requests
headers = {"Authorization": f"Bearer {user_data['email']}"}

# Get current user profile
response = requests.get(f"{BASE_URL}/api/users/me", headers=headers)
print(response.json())

# Create meal
response = requests.post(f"{BASE_URL}/api/meals/", headers=headers, json={
    "title": "Homemade Pizza",
    "description": "Delicious wood-fired pizza",
    "cuisine_type": "Italian",
    "meal_type": "dinner",
    "photos": [],
    "allergen_info": {"contains": ["gluten", "dairy"], "may_contain": []},
    "portion_size": "Serves 2",
    "available_for_sale": True,
    "sale_price": 15.00,
    "available_for_swap": False,
    "swap_preferences": [],
    "preparation_date": "2024-10-22T18:00:00",
    "expires_date": "2024-10-23T20:00:00"
})
print(response.json())
```

### JavaScript/Node.js Client Example

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Register user
async function registerUser() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register/user`, {
      email: 'user@example.com',
      password: 'SecurePass123',
      full_name: 'John Doe',
      location: {
        address: '123 Main St',
        city: 'Raleigh',
        state: 'NC',
        zip_code: '27601'
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response.data);
  }
}

// Login
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data);
  }
}

// Get meals with authentication
async function getMeals(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/meals/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        cuisine_type: 'Italian',
        max_price: 30.00,
        limit: 10
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch meals:', error.response.data);
  }
}

// Create meal
async function createMeal(token, mealData) {
  try {
    const response = await axios.post(`${BASE_URL}/api/meals/`, mealData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create meal:', error.response.data);
  }
}

// Usage
(async () => {
  await registerUser();
  const loginData = await login('user@example.com', 'SecurePass123');
  const meals = await getMeals(loginData.email);
  console.log('Available meals:', meals);
})();
```

### cURL Examples

#### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/register/user" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe",
    "location": {
      "address": "123 Main St",
      "city": "Raleigh",
      "state": "NC",
      "zip_code": "27601"
    }
  }'
```

#### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

#### Get User Profile
```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer user@example.com"
```

#### Create Meal
```bash
curl -X POST "http://localhost:8000/api/meals/" \
  -H "Authorization: Bearer user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Homemade Lasagna",
    "description": "Traditional Italian lasagna with fresh ingredients",
    "cuisine_type": "Italian",
    "meal_type": "dinner",
    "photos": [],
    "allergen_info": {
      "contains": ["dairy", "gluten"],
      "may_contain": []
    },
    "portion_size": "Serves 4",
    "available_for_sale": true,
    "sale_price": 25.00,
    "available_for_swap": false,
    "swap_preferences": [],
    "preparation_date": "2024-10-22T14:00:00",
    "expires_date": "2024-10-24T20:00:00"
  }'
```

#### Get All Meals with Filters
```bash
curl -X GET "http://localhost:8000/api/meals/?cuisine_type=Italian&max_price=30&limit=10"
```

#### Update Meal
```bash
curl -X PUT "http://localhost:8000/api/meals/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "sale_price": 28.00,
    "status": "sold"
  }'
```

#### Delete Meal
```bash
curl -X DELETE "http://localhost:8000/api/meals/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer user@example.com"
```

---

## Data Models Reference

### User Data Model

```python
{
  "_id": ObjectId,                    # MongoDB document ID
  "email": str,                       # Unique email address
  "password": str,                    # Hashed password (bcrypt)
  "full_name": str,                   # User's full name
  "phone": str | None,                # Phone number (optional)
  "location": {
    "address": str,                   # Street address
    "city": str,                      # City name
    "state": str,                     # State/province
    "zip_code": str,                  # Postal code
    "latitude": float | None,         # GPS coordinates (optional)
    "longitude": float | None
  },
  "bio": str | None,                  # User biography
  "profile_picture": str | None,      # Profile picture URL
  "dietary_preferences": {
    "dietary_restrictions": [str],    # e.g., ["vegetarian", "vegan"]
    "allergens": [str],               # e.g., ["peanuts", "shellfish"]
    "cuisine_preferences": [str],     # e.g., ["Italian", "Mexican"]
    "spice_level": str | None         # "mild", "medium", "hot"
  },
  "social_media": {
    "facebook": str | None,
    "instagram": str | None,
    "twitter": str | None
  },
  "role": str,                        # "user" | "admin"
  "status": str,                      # "pending" | "active" | "suspended" | "rejected"
  "stats": {
    "total_meals_sold": int,
    "total_meals_swapped": int,
    "total_meals_purchased": int,
    "average_rating": float,
    "total_reviews": int,
    "badges": [Badge]
  },
  "verified": bool,                   # Email verification status
  "created_at": datetime,             # Account creation timestamp
  "updated_at": datetime              # Last update timestamp
}
```

### Meal Data Model
```python
{
  "_id": ObjectId,                    # MongoDB document ID
  "seller_id": ObjectId,              # Reference to user document
  "title": str,                       # Meal title (3-100 chars)
  "description": str,                 # Meal description (10-1000 chars)
  "cuisine_type": str,                # e.g., "Italian", "Mexican", "Asian"
  "meal_type": str,                   # e.g., "breakfast", "lunch", "dinner"
  "ingredients": str,                 # ⚠️ CHANGED: Comma-separated string
  "photos": [str],                    # Array of photo URLs from /api/meals/upload
  "allergen_info": {
    "contains": [str],                # Definite allergens
    "may_contain": [str]              # Possible cross-contamination
  },
  "nutrition_info": str | None,       # ⚠️ CHANGED: Optional string format
  "portion_size": str,                # e.g., "Serves 4", "1 portion"
  "available_for_sale": bool,         # Can be purchased
  "sale_price": float | None,         # Price in USD
  "available_for_swap": bool,         # Can be swapped
  "swap_preferences": [str],          # Desired swap items
  "status": str,                      # "available" | "pending" | "sold" | "swapped"
  "preparation_date": datetime,       # When meal was prepared
  "expires_date": datetime,           # When meal expires
  "pickup_instructions": str | None,  # Pickup details
  "average_rating": float,            # Average rating (0.0-5.0)
  "total_reviews": int,               # Number of reviews
  "views": int,                       # View count
  "created_at": datetime,             # Creation timestamp
  "updated_at": datetime              # Last update timestamp
}
```

### Review Data Model

```python
{
  "_id": ObjectId,
  "meal_id": ObjectId,                # Reference to meal
  "reviewer_id": ObjectId,            # Reference to reviewer
  "seller_id": ObjectId,              # Reference to seller
  "rating": int,                      # 1-5 stars
  "comment": str | None,              # Optional review text (max 500 chars)
  "transaction_type": str,            # "sale" | "swap"
  "verified_transaction": bool,       # Is this from actual transaction
  "created_at": datetime
}
```

### Badge Data Model

```python
{
  "badge_type": str,                  # "verified_seller" | "top_chef" | "five_star" 
                                      # | "community_favorite" | "swap_master"
  "earned_date": datetime,            # When badge was earned
  "description": str                  # Badge description
}
```

---

## Security Best Practices

### Current Implementation Notes

⚠️ **Important:** The current authentication implementation uses email as Bearer token. This is **NOT production-ready**. 

### Recommended Production Changes

#### 1. Implement JWT Authentication

Replace the current authentication in `dependencies.py`:

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key-here"  # Use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    db = get_database()
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

#### 2. Use Environment Variables

Never hardcode sensitive information:

```python
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
MONGODB_URL = os.getenv("MONGODB_URL")
EMAIL_API_KEY = os.getenv("EMAIL_API_KEY")
```

#### 3. Implement Rate Limiting

Protect against brute force attacks:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin):
    # Login logic
    pass
```

#### 4. Add HTTPS in Production

Use reverse proxy (nginx) with SSL certificates:

```nginx
server {
    listen 443 ssl;
    server_name api.tastebuddies.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

#### 5. Password Security

Current implementation uses bcrypt (good). Ensure:
- Minimum 8 characters
- Complexity requirements enforced
- Maximum 72 characters (bcrypt limit)
- Password history to prevent reuse

#### 6. Input Validation

Always validate and sanitize inputs:
- Use Pydantic models (already implemented)
- Validate ObjectIds before database queries
- Sanitize user-generated content
- Implement file upload validation if adding image uploads

#### 7. Database Security

- Use connection string with authentication in production
- Implement role-based access control (RBAC)
- Enable MongoDB authentication
- Use connection pooling
- Regular backups

```python
MONGODB_URL = "mongodb://username:password@mongodb:27017/tastebuddies?authSource=admin"
```

---

## Performance Optimization

### Database Indexing

Indexes are automatically created. Monitor query performance:

```javascript
// In MongoDB shell
db.meals.find({cuisine_type: "Italian"}).explain("executionStats")
```

### Caching Strategies

Consider implementing caching for:
- Popular meal listings
- User profiles
- Cuisine type filters

Example with Redis:

```python
import redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis_client = redis.from_url("redis://localhost:6379")
    FastAPICache.init(RedisBackend(redis_client), prefix="tastebuddies-cache")

@app.get("/api/meals/")
@cache(expire=300)  # Cache for 5 minutes
async def get_meals():
    # Endpoint logic
    pass
```

### Pagination Best Practices

Always implement pagination for list endpoints:

```python
# Good
GET /api/meals/?skip=0&limit=20

# Avoid
GET /api/meals/  # Returns all meals
```

### Image Optimization

For meal photos:
- Store images in CDN (AWS S3, Cloudflare)
- Implement image resizing
- Use lazy loading on frontend
- Compress images before upload

---

## Testing Guide

### Test Configuration

Tests use a completely isolated MongoDB instance to prevent data conflicts:

**Test Environment:**
- **MongoDB URL:** `mongodb://localhost:27018` (or `mongodb://test-mongo:27017` in Docker)
- **Database Name:** `test_meal_db`
- **Port:** 27018 (separate from main app on 27017)
- **Network:** `test-network` (isolated from main app)

**Configuration Files:**
- `pytest.ini` - Pytest configuration
- `.coveragerc` - Coverage settings
- `conftest.py` - Shared test fixtures

### Running Tests with Docker (Recommended)
```bash
# Run all tests with full coverage report
docker-compose --profile test up test-all --build

# Run specific test suites
docker-compose --profile test up test-auth --build    # Auth tests
docker-compose --profile test up test-meals --build   # Meal tests
docker-compose --profile test up test-users --build   # User tests
docker-compose --profile test up test-main --build    # Main app tests

# View test logs
docker-compose --profile test logs test-all

# Clean test environment
docker-compose --profile test down -v
```

### Running Tests Locally
```bash
# 1. Install test dependencies
pip install pytest pytest-asyncio httpx pytest-cov motor pymongo

# 2. Start test MongoDB on port 27018
docker run -d -p 27018:27017 --name test-mongodb mongo:7.0

# 3. Set environment variables
export TEST_MONGO_URL=mongodb://localhost:27018
export TEST_DB_NAME=test_meal_db
export PYTHONPATH=/path/to/backend

# 4. Run all tests
pytest app/tests/ -v

# 5. Run with coverage report
pytest app/tests/ --cov=app --cov-report=html --cov-report=term-missing

# 6. Run specific test file
pytest app/tests/test_meals.py -v

# 7. Run with verbose output
pytest app/tests/ -v --tb=short --color=yes

# 8. Run and stop on first failure
pytest app/tests/ -x
```

### Test Structure
```
app/tests/
├── __init__.py
├── conftest.py           # Shared fixtures
├── test_auth.py          # Authentication tests
├── test_users.py         # User endpoint tests
├── test_meals.py         # Meal endpoint tests
```

### Test Fixtures (conftest.py)

The test configuration provides several fixtures for writing tests:

**`mongo_client`** (function scope)
- Creates a fresh MongoDB client for each test
- Automatically closes connection after test
- Ensures correct event loop usage

**`test_client`** (synchronous)
- Standard FastAPI TestClient
- Use for simple synchronous tests
- Example: `response = test_client.get("/health")`

**`async_client`** (asynchronous)
- Async HTTP client with mocked database
- Use for async endpoint tests
- Example: `response = await async_client.get("/api/meals/")`

**`authenticated_client`** (asynchronous)
- Pre-authenticated async client
- Automatically includes user authentication
- Use for protected endpoints
- Example: `response = await authenticated_client.post("/api/meals/", json=meal_data)`

**`clean_test_database`** (auto-use fixture)
- Runs automatically before and after EVERY test
- Cleans all collections: meals, users, reviews, verification_tokens
- Ensures complete test isolation
- No configuration needed - it just works

### Writing Tests

**Example: Basic Async Test**
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_meal(authenticated_client):
    """Test creating a new meal"""
    meal_data = {
        "title": "Test Lasagna",
        "description": "Delicious homemade lasagna",
        "cuisine_type": "Italian",
        "meal_type": "dinner",
        "ingredients": "pasta, beef, tomato sauce, cheese",
        "allergen_info": {
            "contains": ["dairy", "gluten"],
            "may_contain": []
        },
        "nutrition_info": "450 calories, 25g protein",
        "portion_size": "Serves 4",
        "available_for_sale": True,
        "sale_price": 25.00,
        "available_for_swap": False,
        "swap_preferences": [],
        "preparation_date": "2024-10-22T18:00:00",
        "expires_date": "2024-10-23T20:00:00"
    }
    
    response = await authenticated_client.post("/api/meals/", json=meal_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Lasagna"
    assert data["cuisine_type"] == "Italian"
    assert "id" in data
```

**Example: Test with Database Verification**
```python
@pytest.mark.asyncio
async def test_meal_persists_in_database(authenticated_client, mongo_client):
    """Test that created meal is actually saved to database"""
    # Create meal via API
    response = await authenticated_client.post("/api/meals/", json=meal_data)
    meal_id = response.json()["id"]
    
    # Verify in database
    db = mongo_client["test_meal_db"]
    meal = await db.meals.find_one({"_id": ObjectId(meal_id)})
    
    assert meal is not None
    assert meal["title"] == "Test Lasagna"
```

**Example: Test Error Handling**
```python
@pytest.mark.asyncio
async def test_create_meal_missing_required_field(authenticated_client):
    """Test that missing required fields return 422"""
    incomplete_data = {
        "title": "Test Meal"
        # Missing required fields
    }
    
    response = await authenticated_client.post("/api/meals/", json=incomplete_data)
    
    assert response.status_code == 422
    assert "detail" in response.json()
```

### Test Database Cleanup

The `clean_test_database` fixture (in conftest.py) automatically:

1. **Before Each Test:**
   - Deletes all documents from `meals` collection
   - Deletes all documents from `users` collection
   - Deletes all documents from `reviews` collection
   - Deletes all documents from `verification_tokens` collection

2. **After Each Test:**
   - Repeats the same cleanup process
   - Ensures no test data leaks to next test

**You don't need to do anything** - this happens automatically for every test.

### Pytest Configuration (pytest.ini)
```ini
[pytest]
# Async test support - use 'auto' mode
asyncio_mode = auto

# Test discovery patterns
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# Output options
addopts = 
    -v                    # Verbose output
    --strict-markers      # Enforce marker registration
    --tb=short            # Short traceback format

# Markers
markers =
    asyncio: marks tests as async tests
    integration: marks tests as integration tests
    slow: marks tests as slow running

# Test paths
testpaths = app/tests

# Minimum Python version
minversion = 3.8
```

### Coverage Configuration (.coveragerc)
```ini
[run]
source = app
omit = 
    */tests/*
    */test_*.py
    */__pycache__/*
    */venv/*

[report]
precision = 2
show_missing = True
skip_covered = False

[html]
directory = htmlcov
```

### Viewing Coverage Reports

After running tests with coverage:
```bash
# Generate HTML report
pytest app/tests/ --cov=app --cov-report=html

# Open in browser
open htmlcov/index.html        # macOS
xdg-open htmlcov/index.html    # Linux
start htmlcov/index.html       # Windows

# View terminal report with missing lines
pytest app/tests/ --cov=app --cov-report=term-missing
```

**Coverage Report Shows:**
- Overall percentage of code covered
- Per-file coverage breakdown
- Specific lines not covered by tests
- Branch coverage information

### Running Specific Tests
```bash
# Run single test function
pytest app/tests/test_meals.py::test_create_meal -v

# Run all tests in a class
pytest app/tests/test_meals.py::TestMealFilters -v

# Run tests matching pattern
pytest app/tests/ -k "dietary" -v

# Run tests with specific marker
pytest app/tests/ -m "integration" -v

# Run and stop on first failure
pytest app/tests/ -x

# Run failed tests from last run
pytest app/tests/ --lf
```

### Test Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_MONGO_URL` | `mongodb://localhost:27018` | Test MongoDB connection |
| `TEST_DB_NAME` | `test_meal_db` | Test database name |
| `PYTHONPATH` | `/app` | Python module search path |
| `PYTHONUNBUFFERED` | `1` | Force unbuffered output for real-time logs |

### Debugging Tests
```bash
# Run with print statements visible
pytest app/tests/ -v -s

# Show local variables on failure
pytest app/tests/ -v -l

# Enter debugger on failure
pytest app/tests/ --pdb

# Show 10 slowest tests
pytest app/tests/ --durations=10
```
---
## Deployment to Production

### Production Checklist

- [ ] Replace email-based authentication with JWT
- [ ] Set up environment variables for secrets
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up MongoDB with authentication
- [ ] Implement rate limiting
- [ ] Configure CORS for specific domains
- [ ] Set up logging and monitoring
- [ ] Configure automated backups
- [ ] Set up CI/CD pipeline
- [ ] Implement error tracking (Sentry, etc.)
- [ ] Configure email service (SendGrid, AWS SES)
- [ ] Set up CDN for static assets
- [ ] Implement health checks and monitoring
- [ ] Configure firewall rules
- [ ] Set up load balancing (if needed)

### Docker Production Build

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    environment:
      - MONGODB_URL=${MONGODB_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_NAME=tastebuddies_prod
    restart: always
    
  mongodb:
    image: mongo:latest
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: always
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: always

volumes:
  mongodb_data:
```

### Environment Variables for Production

Create `.env.production`:

```env
# MongoDB
MONGODB_URL=mongodb://username:password@mongodb:27017/tastebuddies_prod?authSource=admin
DATABASE_NAME=tastebuddies_prod
MONGO_USER=admin
MONGO_PASSWORD=secure_password_here

# Security
SECRET_KEY=your-very-secure-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Service
EMAIL_API_KEY=your-email-service-api-key
EMAIL_FROM=noreply@tastebuddies.com

# Application
ENVIRONMENT=production
DEBUG=false
```

### Monitoring and Logging

Implement structured logging:

```python
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("request_started", extra={
        "method": request.method,
        "path": request.url.path,
        "client": request.client.host
    })
    response = await call_next(request)
    logger.info("request_completed", extra={
        "status_code": response.status_code
    })
    return response
```

---

## API Versioning

Future versions should implement API versioning:

```python
# v1 routes
app.include_router(auth_router, prefix="/api/v1", tags=["Auth v1"])
app.include_router(user_router, prefix="/api/v1", tags=["Users v1"])

# v2 routes (with breaking changes)
app.include_router(auth_router_v2, prefix="/api/v2", tags=["Auth v2"])
```

---

## Support

### Support Channels
- **GitHub Issues:** https://github.com/madisonbook/CSC510/issues
- **Documentation:** This file
- **API Docs:** http://localhost:8000/docs

### Version History

- **v1.0.0** (Current) - Initial release with core functionality
  - User authentication and registration
  - Meal listing and management
  - Basic search and filtering

---

**Last Updated:** October 22, 2024  
**Documentation Version:** 1.0.0
