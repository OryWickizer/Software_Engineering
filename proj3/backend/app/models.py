from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class AccountStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REJECTED = "rejected"


class MealStatus(str, Enum):
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"
    SWAPPED = "swapped"
    UNAVAILABLE = "unavailable"


class TransactionType(str, Enum):
    SALE = "sale"
    SWAP = "swap"


class BadgeType(str, Enum):
    VERIFIED_SELLER = "verified_seller"
    TOP_CHEF = "top_chef"
    FIVE_STAR = "five_star"
    COMMUNITY_FAVORITE = "community_favorite"
    SWAP_MASTER = "swap_master"


# User Models
class Location(BaseModel):
    """User location for nearby meal discovery"""

    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DietaryPreferences(BaseModel):
    """User dietary preferences and restrictions"""

    dietary_restrictions: List[str] = []  # e.g., ["vegetarian", "vegan", "pescatarian"]
    allergens: List[str] = []  # e.g., ["peanuts", "shellfish", "dairy"]
    cuisine_preferences: List[str] = []  # e.g., ["Italian", "Mexican", "Asian"]
    spice_level: Optional[str] = None  # "mild", "medium", "hot"


class SocialMediaLinks(BaseModel):
    """Social media accounts for identity verification"""

    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None


class Badge(BaseModel):
    """User achievement badge"""

    badge_type: BadgeType
    earned_date: datetime = Field(default_factory=datetime.utcnow)
    description: str


class UserStats(BaseModel):
    """User statistics and ratings"""

    total_meals_sold: int = 0
    total_meals_swapped: int = 0
    total_meals_purchased: int = 0
    average_rating: float = 0.0
    total_reviews: int = 0
    badges: List[Badge] = []


class UserCreate(BaseModel):
    """User registration model"""

    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    location: Location
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    dietary_preferences: Optional[DietaryPreferences] = None

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password cannot be longer than 72 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v


class UserUpdate(BaseModel):
    """User profile update model"""

    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[Location] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    dietary_preferences: Optional[DietaryPreferences] = None
    social_media: Optional[SocialMediaLinks] = None


class UserResponse(BaseModel):
    """User response model (no password)"""

    id: str
    email: str
    full_name: str
    phone: Optional[str]
    location: Location
    bio: Optional[str]
    profile_picture: Optional[str]
    dietary_preferences: DietaryPreferences
    social_media: SocialMediaLinks
    role: UserRole
    status: AccountStatus
    stats: UserStats
    created_at: datetime
    verified: bool = False


class UserLogin(BaseModel):
    """User login model"""

    email: EmailStr
    password: str


class VerificationToken(BaseModel):
    email: str
    token: str
    expires_at: datetime
    token_type: str  # "email_verification" or "password_reset"


# Preference Models
class UserPreferences(BaseModel):
    dietary_restrictions: List[str] = []
    favorite_cuisines: List[str] = []
    price_range: Optional[str] = None
    distance_preference: Optional[int] = None  # in miles


class UserAllergenInfo(BaseModel):
    allergens: List[str]


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# ============================================================
# MEAL MODELS
# ============================================================


class Ingredient(BaseModel):
    """Individual ingredient in a meal"""

    name: str = Field(..., min_length=1, max_length=100)
    quantity: Optional[str] = None  # e.g., "2 cups", "500g", "1 tbsp"
    category: Optional[str] = (
        None  # e.g., "protein", "vegetable", "grain", "dairy", "spice"
    )
    is_allergen: bool = False  # Flag for common allergens


class AllergenInfo(BaseModel):
    """Allergen information for meals"""

    contains: List[str] = []  # e.g., ["dairy", "eggs", "nuts"]
    may_contain: List[str] = []  # cross-contamination warnings


class NutritionInfo(BaseModel):
    """Optional nutrition information"""

    calories: Optional[int] = None
    protein_grams: Optional[float] = None
    carbs_grams: Optional[float] = None
    fat_grams: Optional[float] = None
    fiber_grams: Optional[float] = None
    sodium_mg: Optional[float] = None


class MealCreate(BaseModel):
    """Create a new meal listing"""

    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    cuisine_type: str  # e.g., "Italian", "Mexican", "Asian"
    meal_type: str  # e.g., "breakfast", "lunch", "dinner", "snack", "dessert"
    ingredients: str = ""  # Comma-separated ingredient list as string
    photos: List[str] = []  # URLs to uploaded photos
    allergen_info: AllergenInfo
    nutrition_info: Optional[str] = None
    portion_size: str  # e.g., "Serves 2", "1 portion"
    available_for_sale: bool = True
    sale_price: Optional[float] = None  # Price in USD
    available_for_swap: bool = False
    swap_preferences: List[str] = []  # What they'd like to swap for
    preparation_date: datetime
    expires_date: datetime
    pickup_instructions: Optional[str] = None

    @validator("sale_price")
    def validate_price(cls, v, values):
        if values.get("available_for_sale") and (v is None or v <= 0):
            raise ValueError("Sale price must be greater than 0 if available for sale")
        return v


class MealUpdate(BaseModel):
    """Update an existing meal listing"""

    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    cuisine_type: Optional[str] = None
    meal_type: Optional[str] = None
    ingredients: Optional[str] = None
    photos: Optional[List[str]] = None
    allergen_info: Optional[AllergenInfo] = None
    nutrition_info: Optional[str] = None
    portion_size: Optional[str] = None
    available_for_sale: Optional[bool] = None
    sale_price: Optional[float] = None
    available_for_swap: Optional[bool] = None
    swap_preferences: Optional[List[str]] = None
    status: Optional[MealStatus] = None
    pickup_instructions: Optional[str] = None


class MealResponse(BaseModel):
    """Meal response model"""

    id: str
    seller_id: str
    seller_name: str
    seller_rating: float
    title: str
    description: str
    cuisine_type: str
    meal_type: str
    ingredients: Optional[str] = None
    photos: List[str]
    allergen_info: dict
    nutrition_info: Optional[str] = None
    portion_size: str
    available_for_sale: bool
    sale_price: Optional[float]
    available_for_swap: bool
    swap_preferences: List[str]
    status: MealStatus
    preparation_date: datetime
    expires_date: datetime
    pickup_instructions: Optional[str]
    average_rating: float = 0.0
    total_reviews: int = 0
    views: int = 0
    created_at: datetime
    updated_at: datetime


# ============================================================
# REVIEW MODELS
# ============================================================


class ReviewCreate(BaseModel):
    """Create a review for a meal"""

    meal_id: str
    rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    comment: Optional[str] = Field(None, max_length=500)
    transaction_type: TransactionType


class ReviewResponse(BaseModel):
    """Review response model"""

    id: str
    meal_id: str
    reviewer_id: str
    reviewer_name: str
    seller_id: str
    rating: int
    comment: Optional[str]
    transaction_type: TransactionType
    verified_transaction: bool
    created_at: datetime

    # ============================================================


# TRANSACTION MODELS
# ============================================================


class TransactionCreate(BaseModel):
    """Create a purchase or swap offer"""

    meal_id: str
    transaction_type: TransactionType
    offered_meal_id: Optional[str] = None  # For swaps
    message: Optional[str] = None


class TransactionResponse(BaseModel):
    """Transaction response model"""

    id: str
    meal_id: str
    buyer_id: str
    seller_id: str
    transaction_type: TransactionType
    status: str  # "pending", "accepted", "rejected", "completed", "cancelled"
    amount: Optional[float]
    offered_meal_id: Optional[str]
    message: Optional[str]
    created_at: datetime
    updated_at: datetime


# ============================================================
# SEARCH/FILTER MODELS
# ============================================================


class MealSearchFilters(BaseModel):
    """Filters for searching meals"""

    cuisine_type: Optional[str] = None
    meal_type: Optional[str] = None
    max_price: Optional[float] = None
    available_for_sale: Optional[bool] = None
    available_for_swap: Optional[bool] = None
    exclude_allergens: List[str] = []
    exclude_ingredients: List[str] = []  # Exclude specific ingredients
    dietary_restrictions: List[str] = []  # Filter by dietary restrictions
    max_distance_miles: Optional[int] = 10
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    min_rating: Optional[float] = None


# ============================================================
# REVIEW/RATING MODELS
# ============================================================


class ReviewCreate(BaseModel):
    """Create a review for a meal and its seller"""

    meal_id: str
    seller_id: str  # User who created the meal
    rating: float = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = Field(None, max_length=500)
    transaction_type: TransactionType  # "sale" or "swap"

    @validator("rating")
    def validate_rating(cls, v):
        if not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        # Allow half stars (e.g., 3.5, 4.5)
        if v % 0.5 != 0:
            raise ValueError("Rating must be in increments of 0.5")
        return v


class ReviewUpdate(BaseModel):
    """Update an existing review"""

    rating: Optional[float] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)

    @validator("rating")
    def validate_rating(cls, v):
        if v is not None and not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        if v is not None and v % 0.5 != 0:
            raise ValueError("Rating must be in increments of 0.5")
        return v


class ReviewResponse(BaseModel):
    """Review response model"""

    id: str
    reviewer_id: str
    reviewer_name: str
    reviewer_profile_picture: Optional[str]
    meal_id: str
    meal_title: str
    seller_id: str
    rating: float
    comment: Optional[str]
    transaction_type: TransactionType
    created_at: datetime
    updated_at: datetime


class UserReviewsSummary(BaseModel):
    """Summary of user's reviews and ratings"""

    total_reviews: int
    average_rating: float
    rating_distribution: dict  # {"5": 10, "4": 5, "3": 2, "2": 0, "1": 0}
    recent_reviews: List[ReviewResponse]
