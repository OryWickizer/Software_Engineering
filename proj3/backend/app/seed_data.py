from datetime import datetime, timedelta

if __name__ == "__main__":
    from database import get_database
    from utils import hash_password
else:
    from .database import get_database
    from .utils import hash_password


async def seed():
    db = get_database()
    users_count = await db.users.count_documents({})
    meals_count = await db.meals.count_documents({})
    if users_count == 0 and meals_count == 0:
        now = datetime.utcnow()

        users = [
            {
                "full_name": "Alice Johnson",
                "email": "alice@example.com",
                "password": hash_password("password123"),
                "verified": True,
                "role": "user",
                "status": "active",
                "bio": "Passionate home cook specializing in Italian and Mediterranean cuisine."
                " Love sharing my family recipes!",
                "dietary_preferences": {
                    "dietary_restrictions": ["vegetarian-friendly"],
                    "allergens": ["shellfish"],
                    "price_range": "$$",
                    "max_distance": 25,
                    "cuisine_preferences": ["Italian", "Mediterranean", "French"],
                },
                "location": {
                    "address": "123 Main St",
                    "city": "Springfield",
                    "state": "IL",
                    "zip_code": "62704",
                    "latitude": 39.7817213,
                    "longitude": -89.6501481,
                },
                "created_at": now,
                "updated_at": now,
            },
            {
                "full_name": "Bob Smith",
                "email": "bob@example.com",
                "password": hash_password("password123"),
                "verified": True,
                "role": "user",
                "status": "active",
                "bio": "Asian fusion enthusiast and certified sushi chef. Specializing in Japanese"
                " and Korean dishes.",
                "dietary_preferences": {
                    "dietary_restrictions": [],
                    "allergens": ["peanuts"],
                    "price_range": "$$$",
                    "max_distance": 15,
                    "cuisine_preferences": ["Japanese", "Korean", "Thai"],
                },
                "location": {
                    "address": "456 Oak Ave",
                    "city": "Rivertown",
                    "state": "CA",
                    "zip_code": "90210",
                    "latitude": 34.0736204,
                    "longitude": -118.4003563,
                },
                "created_at": now,
                "updated_at": now,
            },
            {
                "full_name": "Maria Garcia",
                "email": "maria@example.com",
                "password": hash_password("password123"),
                "verified": True,
                "role": "user",
                "status": "active",
                "bio": "Mexican street food expert. Love sharing authentic family recipes passed"
                " down through generations.",
                "dietary_preferences": {
                    "dietary_restrictions": ["gluten-free"],
                    "allergens": ["gluten"],
                    "price_range": "$$",
                    "max_distance": 20,
                    "cuisine_preferences": ["Mexican", "Latino", "Spanish"],
                },
                "location": {
                    "address": "789 Pine St",
                    "city": "Austin",
                    "state": "TX",
                    "zip_code": "78701",
                    "latitude": 30.2671530,
                    "longitude": -97.7430608,
                },
                "created_at": now,
                "updated_at": now,
            },
            {
                "full_name": "David Chen",
                "email": "david@example.com",
                "password": hash_password("password123"),
                "verified": True,
                "role": "user",
                "status": "active",
                "bio": "Experienced in traditional Chinese cuisine."
                " Dim sum specialist with a modern twist.",
                "dietary_preferences": {
                    "dietary_restrictions": [],
                    "allergens": ["dairy"],
                    "price_range": "$$",
                    "max_distance": 10,
                    "cuisine_preferences": ["Chinese", "Asian", "Vietnamese"],
                },
                "location": {
                    "address": "321 Elm St",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip_code": "94110",
                    "latitude": 37.7749295,
                    "longitude": -122.4194155,
                },
                "created_at": now,
                "updated_at": now,
            },
            {
                "full_name": "Priya Patel",
                "email": "priya@example.com",
                "password": hash_password("password123"),
                "verified": True,
                "role": "user",
                "status": "active",
                "bio": "Indian cuisine expert specializing in vegetarian and vegan dishes."
                "Love experimenting with spices!",
                "dietary_preferences": {
                    "dietary_restrictions": ["vegetarian"],
                    "allergens": [],
                    "price_range": "$$",
                    "max_distance": 15,
                    "cuisine_preferences": [
                        "Indian",
                        "Middle Eastern",
                        "Mediterranean",
                    ],
                },
                "location": {
                    "address": "567 Maple Ave",
                    "city": "Chicago",
                    "state": "IL",
                    "zip_code": "60601",
                    "latitude": 41.8781136,
                    "longitude": -87.6297982,
                },
                "created_at": now,
                "updated_at": now,
            },
            {
                "full_name": "Admin User",
                "email": "admin@example.com",
                "password": hash_password("adminpass"),
                "verified": True,
                "role": "admin",
                "status": "active",
                "bio": "System administrator and food enthusiast.",
                "dietary_preferences": {
                    "dietary_restrictions": [],
                    "allergens": [],
                    "price_range": "$$$$",
                    "max_distance": 50,
                    "cuisine_preferences": ["American", "Italian", "Japanese"],
                },
                "location": {
                    "address": "1 Admin Plaza",
                    "city": "Metropolis",
                    "state": "NY",
                    "zip_code": "10001",
                    "latitude": 40.7127753,
                    "longitude": -74.0059728,
                },
                "created_at": now,
                "updated_at": now,
            },
        ]

        result = await db.users.insert_many(users)

        email_to_id = {}
        for user_doc, inserted_id in zip(users, result.inserted_ids):
            email_to_id[user_doc["email"]] = inserted_id

        expires_short = now + timedelta(days=1)

        meals = [
            {
                "title": "Extra Homemade Chili",
                "description": "Made a big pot of hearty chili with ground beef and beans!"
                " Have plenty extra to share. Great for a cozy dinner or lunch tomorrow.",
                "sale_price": 8.00,
                "cuisine_type": "American",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("alice@example.com"),
                "seller_location": {
                    "latitude": 39.7817213,
                    "longitude": -89.6501481,
                    "city": "Springfield",
                    "state": "IL",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "3 servings",
                "allergen_info": {"contains": [], "may_contain": ["dairy"]},
                "ingredients": "Ground beef, Kidney beans, Black beans, Diced tomatoes,"
                " Onions, Bell peppers, Chili spices",
                "nutrition_info": "Calories: 380, Protein: 25g, Carbs: 30g, Fat: 18g",
                "photos": [
                    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800"
                ],
                "pickup_instructions": "Can meet at the lobby or front entrance anytime"
                " today until 9 PM",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Homemade Chicken Fried Rice",
                "description": "Made too much fried rice for dinner! It's loaded with"
                " veggies and chicken. Perfect for a quick meal, just needs reheating.",
                "sale_price": 6.50,
                "cuisine_type": "Chinese",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("bob@example.com"),
                "seller_location": {
                    "latitude": 34.0736204,
                    "longitude": -118.4003563,
                    "city": "Rivertown",
                    "state": "CA",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "3 servings",
                "allergen_info": {"contains": ["eggs", "soy"], "may_contain": []},
                "ingredients": "Rice, Chicken, Eggs, Mixed vegetables, Soy sauce,"
                " Green onions, Garlic",
                "nutrition_info": "Calories: 400, Protein: 22g, Carbs: 45g, Fat: 15g",
                "photos": [
                    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800"
                ],
                "pickup_instructions": "I'm in building 2, can meet you in the lobby"
                " anytime tonight",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Extra Enchiladas",
                "description": "Made a big batch of chicken enchiladas with homemade sauce!"
                " Have plenty left and they're super tasty. Can reheat easily.",
                "sale_price": 7.00,
                "cuisine_type": "Mexican",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("maria@example.com"),
                "seller_location": {
                    "latitude": 30.2671530,
                    "longitude": -97.7430608,
                    "city": "Austin",
                    "state": "TX",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "2 servings",
                "allergen_info": {"contains": ["dairy"], "may_contain": ["gluten"]},
                "ingredients": "Corn tortillas, Shredded chicken, Enchilada sauce, Cheese, Onions,"
                " Garlic, Mexican spices",
                "nutrition_info": "Calories: 420, Protein: 28g, Carbs: 35g, Fat: 22g",
                "photos": [
                    "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=800"
                ],
                "pickup_instructions": "I'm around all evening,"
                " just message when you want to pick up!",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Homemade Mac and Cheese",
                "description": "Made a huge pan of creamy mac and cheese with a crispy "
                "breadcrumb topping! Too much for one person, would love to share or swap.",
                "sale_price": 5.50,
                "cuisine_type": "American",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("david@example.com"),
                "seller_location": {
                    "latitude": 37.7749295,
                    "longitude": -122.4194155,
                    "city": "San Francisco",
                    "state": "CA",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "3 servings",
                "allergen_info": {"contains": ["dairy", "gluten"], "may_contain": []},
                "ingredients": "Macaroni, Cheddar cheese, Mozzarella, Milk,"
                " Butter, Breadcrumbs, Seasonings",
                "nutrition_info": "Calories: 450, Protein: 18g, Carbs: 48g, Fat: 22g",
                "photos": [
                    "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800"
                ],
                "pickup_instructions": "Available now until midnight, just ping me!",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Extra Butter Chicken & Rice",
                "description": "Made my mom's butter chicken recipe and have plenty extra!"
                " Comes with basmati rice. Super flavorful and easy to reheat.",
                "sale_price": 7.50,
                "cuisine_type": "Indian",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("priya@example.com"),
                "seller_location": {
                    "latitude": 41.8781136,
                    "longitude": -87.6297982,
                    "city": "Chicago",
                    "state": "IL",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "2 servings",
                "allergen_info": {"contains": ["dairy"], "may_contain": ["nuts"]},
                "ingredients": "Chicken, Tomato sauce, Butter, Cream, Basmati rice,"
                " Indian spices, Garlic, Ginger",
                "nutrition_info": "Calories: 550, Protein: 32g, Carbs: 45g, Fat: 28g",
                "photos": [
                    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800"
                ],
                "pickup_instructions": "I'm in the east building, can meet in common area",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Fresh Baked Chocolate Chip Cookies",
                "description": "Just baked way too many cookies! They're still warm and soft."
                " Perfect for a study snack or dessert. Would love to swap for other snacks!",
                "sale_price": 4.00,
                "cuisine_type": "American",
                "meal_type": "Dessert",
                "seller_id": email_to_id.get("alice@example.com"),
                "seller_location": {
                    "latitude": 39.7817213,
                    "longitude": -89.6501481,
                    "city": "Springfield",
                    "state": "IL",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "12 cookies",
                "allergen_info": {
                    "contains": ["gluten", "dairy", "eggs"],
                    "may_contain": ["nuts"],
                },
                "ingredients": "Flour, Butter, Chocolate chips, Brown sugar, Eggs, Vanilla",
                "nutrition_info": "Calories: 150 per cookie, Sugar: 12g, Fat: 7g",
                "photos": [
                    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800"
                ],
                "pickup_instructions": "Just baked them! Come by anytime tonight!",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Leftover Pizza Night!",
                "description": "Made too much homemade pizza! Have extra BBQ chicken and"
                " Margherita slices. Still super fresh and can be reheated quickly.",
                "sale_price": 5.00,
                "cuisine_type": "Italian",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("bob@example.com"),
                "seller_location": {
                    "latitude": 34.0736204,
                    "longitude": -118.4003563,
                    "city": "Rivertown",
                    "state": "CA",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "4 large slices",
                "allergen_info": {"contains": ["gluten", "dairy"], "may_contain": []},
                "ingredients": "Pizza dough, Mozzarella, Chicken,"
                " BBQ sauce, Tomatoes, Basil, Olive oil",
                "nutrition_info": "Calories: 250 per slice, Protein: 12g, Carbs: 30g, Fat: 10g",
                "photos": [
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800"
                ],
                "pickup_instructions": "In building 3, can meet in the common room!",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
            {
                "title": "Extra Pasta Bake",
                "description": "Made a huge pan of baked ziti with sausage and three cheeses!"
                " Perfect for reheating, and I've got way too much for just me.",
                "sale_price": 6.00,
                "cuisine_type": "Italian",
                "meal_type": "Dinner",
                "seller_id": email_to_id.get("david@example.com"),
                "seller_location": {
                    "latitude": 37.7749295,
                    "longitude": -122.4194155,
                    "city": "San Francisco",
                    "state": "CA",
                },
                "status": "available",
                "available_for_sale": True,
                "available_for_swap": True,
                "portion_size": "3 servings",
                "allergen_info": {"contains": ["dairy", "gluten"], "may_contain": []},
                "ingredients": "Ziti pasta, Italian sausage, Ricotta, Mozzarella, Parmesan,"
                " Marinara sauce, Italian herbs",
                "nutrition_info": "Calories: 480, Protein: 25g, Carbs: 45g, Fat: 24g",
                "photos": [
                    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800"
                ],
                "pickup_instructions": "Free all evening, just message me to meet up!",
                "preparation_date": now,
                "expires_date": expires_short,
                "created_at": now,
                "updated_at": now,
            },
        ]

        meals_result = await db.meals.insert_many(meals)

        print(
            f"✅ Seeded {len(result.inserted_ids)} users and {len(meals_result.inserted_ids)} meals"
        )


if __name__ == "__main__":
    import asyncio
    from database import connect_to_mongo, close_mongo_connection
    
    async def main():
        await connect_to_mongo()
        await seed()
        await close_mongo_connection()
    
    asyncio.run(main())
