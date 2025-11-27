from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import os
import uuid

from ..models import MealCreate, MealUpdate, MealResponse, MealStatus
from ..database import get_database
from ..dependencies import get_current_user, get_optional_current_user

router = APIRouter(prefix="/api/meals", tags=["Meals"])


# Helper function to get dietary restriction exclusion rules
def get_dietary_exclusions(dietary_restriction: str):
    """Get ingredients and allergens to exclude based on dietary restriction"""
    rules = {
        "vegetarian": {
            "ingredients": [
                "beef",
                "pork",
                "chicken",
                "turkey",
                "lamb",
                "meat",
                "fish",
                "seafood",
                "shrimp",
                "salmon",
                "tuna",
            ],
            "allergens": [],
        },
        "vegan": {
            "ingredients": [
                "beef",
                "pork",
                "chicken",
                "turkey",
                "lamb",
                "meat",
                "fish",
                "seafood",
                "shrimp",
                "cheese",
                "butter",
                "cream",
                "milk",
                "yogurt",
                "honey",
                "egg",
            ],
            "allergens": ["dairy", "eggs", "milk"],
        },
        "pescatarian": {
            "ingredients": ["beef", "pork", "chicken", "turkey", "lamb", "meat"],
            "allergens": [],
        },
        "gluten-free": {
            "ingredients": [
                "wheat",
                "flour",
                "bread",
                "pasta",
                "barley",
                "rye",
                "noodles",
            ],
            "allergens": ["wheat", "gluten"],
        },
        "dairy-free": {
            "ingredients": [
                "cheese",
                "butter",
                "cream",
                "milk",
                "yogurt",
                "whey",
                "casein",
            ],
            "allergens": ["dairy", "milk"],
        },
        "nut-free": {
            "ingredients": [
                "peanut",
                "almond",
                "walnut",
                "cashew",
                "pecan",
                "hazelnut",
                "pistachio",
            ],
            "allergens": ["peanuts", "tree nuts", "nuts"],
        },
        "keto": {
            "ingredients": [
                "bread",
                "pasta",
                "rice",
                "potato",
                "sugar",
                "flour",
                "noodles",
                "corn",
            ],
            "allergens": [],
        },
        "paleo": {
            "ingredients": [
                "bread",
                "pasta",
                "rice",
                "bean",
                "lentil",
                "dairy",
                "sugar",
                "flour",
            ],
            "allergens": [],
        },
    }
    return rules.get(dietary_restriction.lower(), {"ingredients": [], "allergens": []})


# Helper function to serialize MongoDB meal
def meal_to_response(meal: dict, seller: dict) -> MealResponse:
    """Convert MongoDB meal document to MealResponse"""
    return MealResponse(
        id=str(meal["_id"]),
        seller_id=str(meal["seller_id"]),
        seller_name=seller["full_name"],
        seller_rating=seller.get("stats", {}).get("average_rating", 0.0),
        title=meal["title"],
        description=meal["description"],
        cuisine_type=meal["cuisine_type"],
        meal_type=meal["meal_type"],
        ingredients=meal.get("ingredients"),
        photos=meal.get("photos", []),
        allergen_info=meal["allergen_info"],
        nutrition_info=meal.get("nutrition_info"),
        portion_size=meal["portion_size"],
        available_for_sale=meal["available_for_sale"],
        sale_price=meal.get("sale_price"),
        available_for_swap=meal.get("available_for_swap", False),
        swap_preferences=meal.get("swap_preferences", []),
        status=meal["status"],
        preparation_date=meal["preparation_date"],
        expires_date=meal["expires_date"],
        pickup_instructions=meal.get("pickup_instructions"),
        average_rating=meal.get("average_rating", 0.0),
        total_reviews=meal.get("total_reviews", 0),
        views=meal.get("views", 0),
        created_at=meal["created_at"],
        updated_at=meal["updated_at"],
    )


def check_meal_matches_dietary_restriction(
    meal: dict, dietary_restriction: str
) -> bool:
    """Check if a meal matches a dietary restriction"""
    exclusions = get_dietary_exclusions(dietary_restriction)

    # Check allergens
    meal_allergens = meal.get("allergen_info", {}).get("contains", [])
    for allergen in exclusions["allergens"]:
        if any(allergen.lower() in ma.lower() for ma in meal_allergens):
            return False

    # Check ingredients (now a string)
    meal_ingredients_str = meal.get("ingredients", "").lower()
    for excluded_ing in exclusions["ingredients"]:
        if excluded_ing in meal_ingredients_str:
            return False

    return True


# Upload one or more photos for a meal. Returns list of accessible URLs.
@router.post("/upload", response_model=List[str])
async def upload_photos(
    files: List[UploadFile] = File(...),
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    """Accept multipart file uploads and save them to server static folder.

    Returns list of URLs that can be stored in the meal `photos` field.
    """
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
    uploads_dir = os.path.abspath(uploads_dir)
    os.makedirs(uploads_dir, exist_ok=True)

    saved_urls: List[str] = []
    for upload in files:
        # sanitize filename by prepending uuid
        filename = f"{uuid.uuid4().hex}_{upload.filename}"
        dest_path = os.path.join(uploads_dir, filename)
        try:
            content = await upload.read()
            with open(dest_path, "wb") as f:
                f.write(content)
        except Exception as e:
            # Log server-side error for easier debugging
            print(
                f"⚠️ Failed to save uploaded file {upload.filename} -> {dest_path}: {e}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save uploaded file: {upload.filename}",
            )

        # URL served by StaticFiles mounted at /static
        url_path = f"/static/uploads/{filename}"
        saved_urls.append(url_path)

    return saved_urls


# Create a new meal
@router.post("/", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
async def create_meal(meal: MealCreate, current_user: dict = Depends(get_current_user)):
    """Create a new meal listing"""
    db = get_database()

    meal_doc = {
        "seller_id": current_user["_id"],
        "title": meal.title,
        "description": meal.description,
        "cuisine_type": meal.cuisine_type,
        "meal_type": meal.meal_type,
        "ingredients": meal.ingredients,
        "photos": meal.photos,
        "allergen_info": meal.allergen_info.model_dump(),
        "nutrition_info": meal.nutrition_info,
        "portion_size": meal.portion_size,
        "available_for_sale": meal.available_for_sale,
        "sale_price": meal.sale_price,
        "available_for_swap": meal.available_for_swap,
        "swap_preferences": meal.swap_preferences,
        "status": MealStatus.AVAILABLE,
        "preparation_date": meal.preparation_date,
        "expires_date": meal.expires_date,
        "pickup_instructions": meal.pickup_instructions,
        "average_rating": 0.0,
        "total_reviews": 0,
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.meals.insert_one(meal_doc)

    # Fetch the created meal
    created_meal = await db.meals.find_one({"_id": result.inserted_id})

    return meal_to_response(created_meal, current_user)


# Get all meals with filters
@router.get("/", response_model=List[MealResponse])
async def get_meals(
    cuisine_type: Optional[str] = None,
    meal_type: Optional[str] = None,
    dietary_restriction: Optional[str] = Query(
        None,
        description="Filter by dietary restriction: vegetarian, vegan, pescatarian,"
        " gluten-free, dairy-free, nut-free, keto, paleo",
    ),
    max_price: Optional[float] = None,
    available_for_sale: Optional[bool] = None,
    available_for_swap: Optional[bool] = None,
    exclude_allergens: Optional[str] = Query(
        None, description="Comma-separated list of allergens to exclude"
    ),
    exclude_ingredients: Optional[str] = Query(
        None, description="Comma-separated list of ingredients to exclude"
    ),
    min_rating: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
):
    """Get all available meals with optional filters"""
    db = get_database()

    # Build query filters
    query = {"status": MealStatus.AVAILABLE}

    if cuisine_type:
        query["cuisine_type"] = cuisine_type
    if meal_type:
        query["meal_type"] = meal_type
    if max_price is not None:
        query["sale_price"] = {"$lte": max_price}
    if available_for_sale is not None:
        query["available_for_sale"] = available_for_sale
    if available_for_swap is not None:
        query["available_for_swap"] = available_for_swap
    if min_rating is not None:
        query["average_rating"] = {"$gte": min_rating}

    # Filter by specific allergens
    if exclude_allergens:
        allergen_list = [a.strip() for a in exclude_allergens.split(",")]
        # Exclude meals that contain any of these allergens
        for allergen in allergen_list:
            if "allergen_info.contains" not in query:
                query["allergen_info.contains"] = {"$nin": []}
            query["allergen_info.contains"]["$nin"].append(allergen)

    # Filter by specific ingredients (case-insensitive)
    if exclude_ingredients:
        ingredient_list = [i.strip() for i in exclude_ingredients.split(",")]
        # Create regex patterns for each ingredient
        ingredient_patterns = [
            {"ingredients.name": {"$not": {"$regex": ing, "$options": "i"}}}
            for ing in ingredient_list
        ]
        if "$and" in query:
            query["$and"].extend(ingredient_patterns)
        else:
            query["$and"] = ingredient_patterns

    # Fetch meals
    meals_cursor = db.meals.find(query).skip(skip).limit(limit).sort("created_at", -1)
    meals = await meals_cursor.to_list(length=None)

    # Apply dietary restriction filter (post-query filtering for complex logic)
    if dietary_restriction:
        meals = [
            meal
            for meal in meals
            if check_meal_matches_dietary_restriction(meal, dietary_restriction)
        ]

    # Fetch sellers for each meal
    meal_responses = []
    for meal in meals[:limit]:  # Re-apply limit after filtering
        seller = await db.users.find_one({"_id": meal["seller_id"]})
        if seller:
            meal_responses.append(meal_to_response(meal, seller))

    return meal_responses


# Get meal by ID
@router.get("/{meal_id}", response_model=MealResponse)
async def get_meal_by_id(meal_id: str):
    """Get a specific meal by ID"""
    db = get_database()

    if not ObjectId.is_valid(meal_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid meal ID"
        )

    meal = await db.meals.find_one({"_id": ObjectId(meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    # Increment views
    await db.meals.update_one({"_id": ObjectId(meal_id)}, {"$inc": {"views": 1}})
    meal["views"] = meal.get("views", 0) + 1

    # Fetch seller
    seller = await db.users.find_one({"_id": meal["seller_id"]})
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
        )

    return meal_to_response(meal, seller)


# Get my meals
@router.get("/my/listings", response_model=List[MealResponse])
async def get_my_meals(current_user: dict = Depends(get_current_user)):
    """Get all meals created by the authenticated user"""
    db = get_database()

    meals_cursor = db.meals.find({"seller_id": current_user["_id"]}).sort(
        "created_at", -1
    )
    meals = await meals_cursor.to_list(length=100)

    meal_responses = [meal_to_response(meal, current_user) for meal in meals]
    return meal_responses


# Get meals matching user's dietary preferences
@router.get("/my/recommendations", response_model=List[MealResponse])
async def get_recommended_meals(
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    """Get meals that match the user's dietary preferences"""
    db = get_database()

    dietary_prefs = current_user.get("dietary_preferences", {})

    # Build query based on user preferences
    query = {"status": MealStatus.AVAILABLE, "seller_id": {"$ne": current_user["_id"]}}

    # Exclude user's allergens
    allergens = dietary_prefs.get("allergens", [])
    if allergens:
        for allergen in allergens:
            if "allergen_info.contains" not in query:
                query["allergen_info.contains"] = {"$nin": []}
            query["allergen_info.contains"]["$nin"].append(allergen)

    # Exclude user's avoided ingredients
    avoid_ingredients = dietary_prefs.get("avoid_ingredients", [])
    if avoid_ingredients:
        ingredient_patterns = [
            {"ingredients.name": {"$not": {"$regex": ing, "$options": "i"}}}
            for ing in avoid_ingredients
        ]
        query["$and"] = ingredient_patterns

    # Fetch meals
    meals_cursor = db.meals.find(query).skip(skip).limit(limit).sort("created_at", -1)
    meals = await meals_cursor.to_list(length=None)

    # Apply dietary restrictions filter
    dietary_restrictions = dietary_prefs.get("dietary_restrictions", [])
    if dietary_restrictions:
        # Filter meals that match ALL dietary restrictions
        for restriction in dietary_restrictions:
            meals = [
                meal
                for meal in meals
                if check_meal_matches_dietary_restriction(meal, restriction)
            ]

    # Prefer cuisine preferences if specified
    cuisine_prefs = dietary_prefs.get("cuisine_preferences", [])
    if cuisine_prefs:
        preferred_meals = [m for m in meals if m.get("cuisine_type") in cuisine_prefs]
        other_meals = [m for m in meals if m.get("cuisine_type") not in cuisine_prefs]
        meals = preferred_meals + other_meals

    # Fetch sellers for each meal
    meal_responses = []
    for meal in meals[:limit]:
        seller = await db.users.find_one({"_id": meal["seller_id"]})
        if seller:
            meal_responses.append(meal_to_response(meal, seller))

    return meal_responses


# Update a meal
@router.put("/{meal_id}", response_model=MealResponse)
async def update_meal(
    meal_id: str,
    meal_update: MealUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a meal listing"""
    db = get_database()

    if not ObjectId.is_valid(meal_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid meal ID"
        )

    # Check if meal exists and belongs to user
    meal = await db.meals.find_one({"_id": ObjectId(meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    if meal["seller_id"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this meal",
        )

    # Build update document
    update_data = {"updated_at": datetime.utcnow()}

    if meal_update.title is not None:
        update_data["title"] = meal_update.title
    if meal_update.description is not None:
        update_data["description"] = meal_update.description
    if meal_update.cuisine_type is not None:
        update_data["cuisine_type"] = meal_update.cuisine_type
    if meal_update.meal_type is not None:
        update_data["meal_type"] = meal_update.meal_type
    if meal_update.ingredients is not None:
        update_data["ingredients"] = meal_update.ingredients
    if meal_update.photos is not None:
        update_data["photos"] = meal_update.photos
    if meal_update.allergen_info is not None:
        update_data["allergen_info"] = meal_update.allergen_info.model_dump()
    if meal_update.nutrition_info is not None:
        update_data["nutrition_info"] = meal_update.nutrition_info
    if meal_update.portion_size is not None:
        update_data["portion_size"] = meal_update.portion_size
    if meal_update.available_for_sale is not None:
        update_data["available_for_sale"] = meal_update.available_for_sale
    if meal_update.sale_price is not None:
        update_data["sale_price"] = meal_update.sale_price
    if meal_update.available_for_swap is not None:
        update_data["available_for_swap"] = meal_update.available_for_swap
    if meal_update.swap_preferences is not None:
        update_data["swap_preferences"] = meal_update.swap_preferences
    if meal_update.status is not None:
        update_data["status"] = meal_update.status
    if meal_update.pickup_instructions is not None:
        update_data["pickup_instructions"] = meal_update.pickup_instructions

    # Update meal
    result = await db.meals.update_one(
        {"_id": ObjectId(meal_id)}, {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No changes made to meal"
        )

    # Fetch updated meal
    updated_meal = await db.meals.find_one({"_id": ObjectId(meal_id)})
    return meal_to_response(updated_meal, current_user)


# Delete a meal
@router.delete("/{meal_id}")
async def delete_meal(meal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a meal listing"""
    db = get_database()

    if not ObjectId.is_valid(meal_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid meal ID"
        )

    # Check if meal exists and belongs to user
    meal = await db.meals.find_one({"_id": ObjectId(meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    if meal["seller_id"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this meal",
        )

    # Delete meal
    result = await db.meals.delete_one({"_id": ObjectId(meal_id)})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    return {"message": "Meal successfully deleted"}
