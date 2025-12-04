// API service for meal-related operations

const backendURL = "http://localhost:8000";

/**
 * Get user email from localStorage for authentication
 */
const getAuthHeaders = () => {
  const userEmail = localStorage.getItem("email");
  if (!userEmail) {
    throw new Error("Not authenticated. Please login.");
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${userEmail}`
  };
};

/**
 * Create a new meal
 * POST /api/meals/
 */
export const createMeal = async (mealData) => {
  try {
    const response = await fetch(`${backendURL}/api/meals/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(mealData)
    });

    if (!response.ok) {
      // Parse structured FastAPI/Pydantic errors (422) into a readable message
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (e) {
        throw new Error("Failed to create meal");
      }

      if (errorBody && Array.isArray(errorBody.detail)) {
        const messages = errorBody.detail.map(d => d.msg || JSON.stringify(d)).join('; ');
        throw new Error(messages || "Failed to create meal");
      }

      throw new Error(errorBody.detail || errorBody.message || "Failed to create meal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating meal:", error);
    throw error;
  }
};

/**
 * Get all meals with optional filters
 * GET /api/meals/
 */
export const getAllMeals = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();

    if (filters.cuisine_type) queryParams.append("cuisine_type", filters.cuisine_type);
    if (filters.meal_type) queryParams.append("meal_type", filters.meal_type);
    if (filters.max_price) queryParams.append("max_price", filters.max_price);
    if (filters.available_for_sale !== undefined) {
      queryParams.append("available_for_sale", filters.available_for_sale);
    }
    if (filters.available_for_swap !== undefined) {
      queryParams.append("available_for_swap", filters.available_for_swap);
    }
    if (filters.skip) queryParams.append("skip", filters.skip);
    if (filters.limit) queryParams.append("limit", filters.limit);

    // Add location parameters for distance calculation
    if (filters.latitude !== undefined && filters.latitude !== null) {
      queryParams.append("latitude", filters.latitude);
    }
    if (filters.longitude !== undefined && filters.longitude !== null) {
      queryParams.append("longitude", filters.longitude);
    }
    if (filters.max_distance_miles !== undefined && filters.max_distance_miles !== null) {
      queryParams.append("max_distance_miles", filters.max_distance_miles);
    }

    const url = `${backendURL}/api/meals/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching meals:", error);
    throw error;
  }
};

/**
 * Get recommended meals based on user preferences
 * GET /api/meals/my/recommendations
 */
export const getRecommendedMeals = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();

    if (filters.skip) queryParams.append("skip", filters.skip);
    if (filters.limit) queryParams.append("limit", filters.limit);

    // Add location parameters for distance calculation
    if (filters.latitude !== undefined && filters.latitude !== null) {
      queryParams.append("latitude", filters.latitude);
    }
    if (filters.longitude !== undefined && filters.longitude !== null) {
      queryParams.append("longitude", filters.longitude);
    }
    if (filters.max_distance_miles !== undefined && filters.max_distance_miles !== null) {
      queryParams.append("max_distance_miles", filters.max_distance_miles);
    }

    const url = `${backendURL}/api/meals/my/recommendations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      throw new Error("Failed to fetch recommended meals");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recommended meals:", error);
    throw error;
  }
};

/**
 * Get a specific meal by ID
 * GET /api/meals/{meal_id}
 */
export const getMealById = async (mealId) => {
  try {
    const response = await fetch(`${backendURL}/api/meals/${mealId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Meal not found");
      }
      throw new Error("Failed to fetch meal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching meal:", error);
    throw error;
  }
};

/**
 * Get my meals (authenticated user's meals)
 * GET /api/meals/my/listings
 */
export const getMyMeals = async () => {
  try {
    const response = await fetch(`${backendURL}/api/meals/my/listings`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      throw new Error("Failed to fetch your meals");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching my meals:", error);
    throw error;
  }
};

/**
 * Update a meal
 * PUT /api/meals/{meal_id}
 */
export const updateMeal = async (mealId, updateData) => {
  try {
    const response = await fetch(`${backendURL}/api/meals/${mealId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        throw new Error("You don't have permission to update this meal");
      }
      if (response.status === 404) {
        throw new Error("Meal not found");
      }
      throw new Error(error.detail || "Failed to update meal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
};

/**
 * Update user's dietary preferences
 * PUT /api/users/me/dietary-preferences
 */
export const updateDietaryPreferences = async (preferences) => {
  try {
    const response = await fetch(`${backendURL}/api/users/me/dietary-preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders() // include auth headers
      },
      body: JSON.stringify({
        dietary_restrictions: [], // not using
        allergens: preferences.allergens,
        cuisine_preferences: preferences.cuisines,
        spice_level: "" // not using
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update dietary preferences");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating dietary preferences:", error);
    throw error;
  }
};


/**
 * Delete a meal
 * DELETE /api/meals/{meal_id}
 */
export const deleteMeal = async (mealId) => {
  try {
    const response = await fetch(`${backendURL}/api/meals/${mealId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        throw new Error("You don't have permission to delete this meal");
      }
      if (response.status === 404) {
        throw new Error("Meal not found");
      }
      throw new Error(error.detail || "Failed to delete meal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting meal:", error);
    throw error;
  }
};

// Example meal data structure for createMeal:
export const exampleMealData = {
  title: "Homemade Lasagna",
  description: "Delicious Italian lasagna with fresh ingredients",
  cuisine_type: "Italian",
  meal_type: "Dinner",
  photos: ["https://example.com/photo1.jpg"],
  allergen_info: {
    contains_dairy: true,
    contains_gluten: true,
    contains_nuts: false,
    contains_eggs: true,
    contains_shellfish: false,
    contains_soy: false,
    other_allergens: []
  },
  nutrition_info: {
    calories: 450,
    protein_g: 25,
    carbs_g: 40,
    fat_g: 18,
    fiber_g: 5,
    sodium_mg: 650
  },
  portion_size: "Large (serves 2)",
  available_for_sale: true,
  sale_price: 15.00,
  available_for_swap: true,
  swap_preferences: ["Desserts", "Asian cuisine"],
  preparation_date: "2024-10-22T10:00:00Z",
  expires_date: "2024-10-25T23:59:59Z",
  pickup_instructions: "Available for pickup between 5-7 PM at my apartment"
};

/**
 * Upload photo files to the backend and get back URLs.
 * files: FileList or Array<File>
 */
export const uploadPhotos = async (files) => {
  try {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));

    // Use same auth helper as other endpoints so we fail fast if not logged in
    const headers = getAuthHeaders();
    // remove Content-Type from headers because fetch/Browser will set multipart boundary
    delete headers['Content-Type'];

    const response = await fetch(`${backendURL}/api/meals/upload`, {
      method: 'POST',
      headers,
      body: form
    });

    if (!response.ok) {
      let errBody;
      try { errBody = await response.json(); } catch { errBody = await response.text(); }
      throw new Error(errBody.detail || errBody || 'Failed to upload photos');
    }

    const data = await response.json();
    // returned items are relative paths like /static/uploads/..., convert to absolute URLs
    return data.map(p => `${backendURL}${p}`);
  } catch (error) {
    console.error('Error uploading photos:', error);
    throw error;
  }
};