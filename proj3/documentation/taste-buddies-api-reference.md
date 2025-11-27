# Taste Buddies - API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Meal Endpoints](#meal-endpoints)
5. [System Endpoints](#system-endpoints)

---

## Authentication

Most endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

**Current Implementation Note:** The temporary implementation uses email as the Bearer token. Production deployment should use JWT tokens.

### Example Authorization Header

```bash
curl -H "Authorization: Bearer user@example.com" \
  http://localhost:8000/api/users/me
```

---

## Authentication Endpoints

### Register User

Creates a new user account and sends verification email.

**Endpoint:** `POST /api/auth/register/user`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "location": {
    "address": "123 Main St",
    "city": "Raleigh",
    "state": "NC",
    "zip_code": "27601",
    "latitude": 35.7796,
    "longitude": -78.6382
  },
  "bio": "Love cooking Italian food!",
  "profile_picture": "https://example.com/photo.jpg"
}
```

**Required Fields:**
- `email` - Valid email address
- `password` - Must meet requirements (see below)
- `full_name` - User's full name
- `location.address` - Street address
- `location.city` - City name
- `location.state` - State/province code
- `location.zip_code` - Postal code

**Optional Fields:**
- `phone` - Contact phone number
- `location.latitude` - GPS latitude coordinate
- `location.longitude` - GPS longitude coordinate
- `bio` - User biography/description
- `profile_picture` - URL to profile image

**Password Requirements:**
- Minimum 8 characters
- Maximum 72 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Response:** `201 Created`
```json
{
  "message": "User account created successfully. Please check your email to verify your account.",
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400 Bad Request` - Email already exists
- `422 Unprocessable Entity` - Validation errors

---

### Login

Authenticates user and returns user information.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "full_name": "John Doe"
}
```

**Error Responses:**
- `401 Unauthorized` - Incorrect email or password
- `403 Forbidden` - Email not verified

---

## User Endpoints

### Get Current User Profile

Returns the authenticated user's complete profile.

**Endpoint:** `GET /api/users/me`

**Authentication:** Required

**Example Request:**
```bash
curl -H "Authorization: Bearer user@example.com" \
  http://localhost:8000/api/users/me
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "location": {
    "address": "123 Main St",
    "city": "Raleigh",
    "state": "NC",
    "zip_code": "27601",
    "latitude": 35.7796,
    "longitude": -78.6382
  },
  "bio": "Love cooking Italian food!",
  "profile_picture": "https://example.com/photo.jpg",
  "dietary_preferences": {
    "dietary_restrictions": ["vegetarian"],
    "allergens": ["peanuts"],
    "cuisine_preferences": ["Italian", "Mexican"],
    "spice_level": "medium"
  },
  "social_media": {
    "facebook": "https://facebook.com/johndoe",
    "instagram": "@johndoe",
    "twitter": "@johndoe"
  },
  "role": "user",
  "status": "active",
  "stats": {
    "total_meals_sold": 10,
    "total_meals_swapped": 5,
    "total_meals_purchased": 8,
    "average_rating": 4.5,
    "total_reviews": 12,
    "badges": []
  },
  "created_at": "2024-01-15T10:30:00",
  "verified": true
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication token

---

### Get User by ID

Returns the public profile of any user.

**Endpoint:** `GET /api/users/{user_id}`

**Path Parameters:**
- `user_id` (string, required) - MongoDB ObjectId (24 hex characters)

**Example Request:**
```bash
curl http://localhost:8000/api/users/507f1f77bcf86cd799439011
```

**Response:** `200 OK` - Same structure as Get Current User Profile

**Error Responses:**
- `400 Bad Request` - Invalid user ID format
- `404 Not Found` - User not found

---

### Update User Profile

Updates the authenticated user's profile information.

**Endpoint:** `PUT /api/users/me`

**Authentication:** Required

**Request Body:** (all fields optional)
```json
{
  "full_name": "Jane Doe",
  "phone": "+1234567890",
  "location": {
    "address": "456 Oak Ave",
    "city": "Durham",
    "state": "NC",
    "zip_code": "27701",
    "latitude": 35.9940,
    "longitude": -78.8986
  },
  "bio": "Passionate about healthy cooking",
  "profile_picture": "https://example.com/new-photo.jpg"
}
```

**Response:** `200 OK` - Updated user profile object

**Error Responses:**
- `400 Bad Request` - No changes made or invalid data
- `401 Unauthorized` - Not authenticated

---

### Update Dietary Preferences

Updates user's dietary preferences and restrictions.

**Endpoint:** `PUT /api/users/me/dietary-preferences`

**Authentication:** Required

**Request Body:**
```json
{
  "dietary_restrictions": ["vegetarian", "gluten-free"],
  "allergens": ["peanuts", "shellfish", "dairy"],
  "cuisine_preferences": ["Italian", "Thai", "Mediterranean"],
  "spice_level": "hot"
}
```

**Spice Level Options:**
- `"mild"`
- `"medium"`
- `"hot"`

**Common Dietary Restrictions:**
- `"vegetarian"`
- `"vegan"`
- `"pescatarian"`
- `"halal"`
- `"kosher"`
- `"gluten-free"`
- `"dairy-free"`

**Response:** `200 OK` - Updated user profile

---

### Update Social Media Links

Updates user's social media links for identity verification.

**Endpoint:** `PUT /api/users/me/social-media`

**Authentication:** Required

**Request Body:**
```json
{
  "facebook": "https://facebook.com/johndoe",
  "instagram": "@johndoe_chef",
  "twitter": "@johndoe"
}
```

**Response:** `200 OK` - Updated user profile

---

### Get User Statistics

Returns the authenticated user's statistics and badges.

**Endpoint:** `GET /api/users/me/stats`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "total_meals_sold": 10,
  "total_meals_swapped": 5,
  "total_meals_purchased": 8,
  "average_rating": 4.5,
  "total_reviews": 12,
  "badges": [
    {
      "badge_type": "verified_seller",
      "earned_date": "2024-02-01T10:00:00",
      "description": "Completed email verification"
    },
    {
      "badge_type": "top_chef",
      "earned_date": "2024-03-15T14:30:00",
      "description": "Sold 50+ meals"
    }
  ]
}
```

**Badge Types:**
- `verified_seller` - Email verified
- `top_chef` - High sales volume
- `five_star` - Excellent ratings
- `community_favorite` - Popular seller
- `swap_master` - Active in meal swapping

---

### Delete User Account

Permanently deletes the user account and all associated data.

**Endpoint:** `DELETE /api/users/me`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Account successfully deleted"
}
```

**What Gets Deleted:**
- User account and profile
- All meal listings created by user
- All reviews written by user

**Note:** This action is permanent and cannot be undone.

---

## Meal Endpoints

### Create Meal

Creates a new meal listing.

**Endpoint:** `POST /api/meals/`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Homemade Lasagna",
  "description": "Traditional Italian lasagna with homemade pasta, beef ragu, and bechamel sauce. Made with fresh ingredients and family recipe.",
  "cuisine_type": "Italian",
  "meal_type": "dinner",
  "ingredients": "pasta, beef, tomato sauce, cheese, bechamel, herbs",
  "photos": [
    "/static/uploads/abc123_lasagna1.jpg",
    "/static/uploads/def456_lasagna2.jpg"
  ],
  "allergen_info": {
    "contains": ["dairy", "eggs", "gluten"],
    "may_contain": ["nuts"]
  },
  "nutrition_info": "450 calories, 25g protein, 40g carbs, 18g fat",
  "portion_size": "Serves 4",
  "available_for_sale": true,
  "sale_price": 25.00,
  "available_for_swap": true,
  "swap_preferences": ["Thai curry", "Mexican enchiladas"],
  "preparation_date": "2024-10-22T14:00:00",
  "expires_date": "2024-10-24T20:00:00",
  "pickup_instructions": "Pick up from side door between 5-7 PM"
}
```

**Required Fields:**
- `title` - 3-100 characters
- `description` - 10-1000 characters
- `cuisine_type` - Cuisine category
- `meal_type` - Type of meal
- `allergen_info` - Allergen information object
- `portion_size` - Serving size description
- `available_for_sale` - Boolean
- `available_for_swap` - Boolean
- `preparation_date` - ISO 8601 datetime
- `expires_date` - ISO 8601 datetime

**Optional Fields:**
- `photos` - Array of image URLs
- `nutrition_info` - Nutritional information object
- `sale_price` - Required if available_for_sale is true
- `swap_preferences` - Array of desired swap items
- `pickup_instructions` - Pickup details

**Meal Types:**
- `"breakfast"`
- `"lunch"`
- `"dinner"`
- `"snack"`
- `"dessert"`

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "seller_id": "507f1f77bcf86cd799439012",
  "seller_name": "John Doe",
  "seller_rating": 4.5,
  "title": "Homemade Lasagna",
  "description": "Traditional Italian lasagna...",
  "cuisine_type": "Italian",
  "meal_type": "dinner",
  "photos": ["https://example.com/lasagna1.jpg"],
  "allergen_info": {
    "contains": ["dairy", "eggs", "gluten"],
    "may_contain": ["nuts"]
  },
  "nutrition_info": {
    "calories": 450,
    "protein_grams": 25.5,
    "carbs_grams": 40.0,
    "fat_grams": 18.5
  },
  "portion_size": "Serves 4",
  "available_for_sale": true,
  "sale_price": 25.00,
  "available_for_swap": true,
  "swap_preferences": ["Thai curry", "Mexican enchiladas"],
  "status": "available",
  "preparation_date": "2024-10-22T14:00:00",
  "expires_date": "2024-10-24T20:00:00",
  "pickup_instructions": "Pick up from side door between 5-7 PM",
  "average_rating": 0.0,
  "total_reviews": 0,
  "views": 0,
  "created_at": "2024-10-22T10:00:00",
  "updated_at": "2024-10-22T10:00:00"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated

---
### Upload Meal Photos

Uploads one or more photos for a meal listing.

**Endpoint:** `POST /api/meals/upload`

**Authentication:** Optional

**Content-Type:** `multipart/form-data`

**Request Body:**
- `files` (array of files, required) - One or more image files to upload

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/meals/upload" \
  -H "Authorization: Bearer user@example.com" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg"
```

**Response:** `200 OK`
```json
[
  "/static/uploads/abc123def456_photo1.jpg",
  "/static/uploads/789xyz012_photo2.jpg"
]
```

**Response Description:**
- Returns array of URL paths that can be stored in meal `photos` field
- Each filename is prefixed with a UUID for uniqueness
- Files are accessible via the `/static/uploads/` path

**Error Responses:**
- `500 Internal Server Error` - Failed to save uploaded file

---

### Get Recommended Meals

Returns meals that match the authenticated user's dietary preferences.

**Endpoint:** `GET /api/meals/my/recommendations`

**Authentication:** Required

**Query Parameters:**
- `skip` (integer, optional) - Number of records to skip (default: 0)
- `limit` (integer, optional) - Maximum records to return (default: 20)

**Example Request:**
```bash
curl -H "Authorization: Bearer user@example.com" \
  "http://localhost:8000/api/meals/my/recommendations?limit=10"
```

**Response:** `200 OK` - Array of MealResponse objects

**Filtering Logic:**
- Excludes meals created by the user
- Filters out meals containing user's allergens
- Excludes meals with ingredients user wants to avoid
- Applies user's dietary restrictions (vegetarian, vegan, etc.)
- Prioritizes meals from user's preferred cuisines

---
### Get All Meals

Returns a paginated list of available meals with optional filters.

**Endpoint:** `GET /api/meals/`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cuisine_type` | string | No | Filter by cuisine type |
| `meal_type` | string | No | Filter by meal type |
| `max_price` | float | No | Maximum price filter |
| `available_for_sale` | boolean | No | Filter by sale availability |
| `available_for_swap` | boolean | No | Filter by swap availability |
| `skip` | integer | No | Number of records to skip (default: 0) |
| `limit` | integer | No | Maximum records to return (default: 20) |
| `dietary_restriction` | string | No | Filter by: vegetarian, vegan, pescatarian, gluten-free, dairy-free, nut-free, keto, paleo |
| `exclude_allergens` | string | No | Comma-separated list of allergens to exclude |
| `exclude_ingredients` | string | No | Comma-separated list of ingredients to exclude |
| `min_rating` | float | No | Minimum average rating filter |

**Example Requests:**
```bash
# Get all Italian meals
curl "http://localhost:8000/api/meals/?cuisine_type=Italian"

# Get meals under $30
curl "http://localhost:8000/api/meals/?max_price=30.00"

# Get dinner meals available for swap
curl "http://localhost:8000/api/meals/?meal_type=dinner&available_for_swap=true"

# Pagination example (get next 20 meals)
curl "http://localhost:8000/api/meals/?skip=20&limit=20"

# Combined filters
curl "http://localhost:8000/api/meals/?cuisine_type=Italian&max_price=30&limit=10"

# Filter by dietary restriction
curl "http://localhost:8000/api/meals/?dietary_restriction=vegan"

# Exclude specific allergens
curl "http://localhost:8000/api/meals/?exclude_allergens=dairy,nuts"

# Exclude specific ingredients
curl "http://localhost:8000/api/meals/?exclude_ingredients=chicken,beef"

# Combine multiple filters
curl "http://localhost:8000/api/meals/?dietary_restriction=vegetarian&exclude_allergens=dairy&min_rating=4.0"
```

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "seller_id": "507f1f77bcf86cd799439012",
    "seller_name": "John Doe",
    "seller_rating": 4.5,
    "title": "Homemade Lasagna",
    ...
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "seller_id": "507f1f77bcf86cd799439014",
    "seller_name": "Jane Smith",
    "seller_rating": 4.8,
    "title": "Chicken Parmesan",
    ...
  }
]
```
**Dietary Restriction Filtering:**

Each restriction automatically excludes specific ingredients and allergens:

- **vegetarian**: Excludes meat, poultry, fish, seafood
- **vegan**: Excludes all animal products (meat, dairy, eggs, honey)
- **pescatarian**: Excludes meat and poultry (allows fish)
- **gluten-free**: Excludes wheat, flour, bread, pasta, barley, rye
- **dairy-free**: Excludes cheese, butter, cream, milk, yogurt
- **nut-free**: Excludes all nuts and peanuts
- **keto**: Excludes bread, pasta, rice, potatoes, sugar, flour
- **paleo**: Excludes grains, legumes, dairy, processed foods

---

### Get Meal by ID

Returns detailed information about a specific meal. Automatically increments the view count.

**Endpoint:** `GET /api/meals/{meal_id}`

**Path Parameters:**
- `meal_id` (string, required) - MongoDB ObjectId

**Example Request:**
```bash
curl http://localhost:8000/api/meals/507f1f77bcf86cd799439011
```

**Response:** `200 OK` - Single meal object with full details

**Error Responses:**
- `400 Bad Request` - Invalid meal ID format
- `404 Not Found` - Meal not found

---

### Get My Meals

Returns all meals created by the authenticated user.

**Endpoint:** `GET /api/meals/my/listings`

**Authentication:** Required

**Example Request:**
```bash
curl -H "Authorization: Bearer user@example.com" \
  http://localhost:8000/api/meals/my/listings
```

**Response:** `200 OK` - Array of meal objects sorted by creation date (newest first)

---

### Update Meal

Updates an existing meal listing. Only the meal owner can update.

**Endpoint:** `PUT /api/meals/{meal_id}`

**Authentication:** Required

**Path Parameters:**
- `meal_id` (string, required) - MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Lasagna Recipe",
  "description": "Now with extra cheese!",
  "sale_price": 28.00,
  "status": "available",
  "pickup_instructions": "Ring doorbell twice"
}
```

**Status Values:**
- `"available"` - Meal is available for purchase/swap
- `"pending"` - Transaction in progress
- `"sold"` - Meal has been sold
- `"swapped"` - Meal has been swapped
- `unavailable` - Temporarily unavailable

**Response:** `200 OK` - Updated meal object

**Error Responses:**
- `400 Bad Request` - Invalid meal ID or no changes made
- `403 Forbidden` - Not the meal owner
- `404 Not Found` - Meal not found

#### Delete Meal

**DELETE** `/api/meals/{meal_id}`

Permanently deletes a meal listing. Only the meal owner can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `meal_id` (string, required) - MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "message": "Meal successfully deleted"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid meal ID
- `403 Forbidden` - Not the meal owner
- `404 Not Found` - Meal not found

---

### System Endpoints

#### Root

**GET** `/`

Returns API welcome message.

**Response:** `200 OK`
```json
{
  "message": "Welcome to Taste Buddiez API",
  "tagline": "Connecting neighbors through homemade meals"
}
```

#### Health Check

**GET** `/health`

Returns API health status.

**Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

#### Debug: List Users

**GET** `/api/debug/users`

Returns list of all users (development only, limit 100).

**Response:** `200 OK` - Array of user objects

---
