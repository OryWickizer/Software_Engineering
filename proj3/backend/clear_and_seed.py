import asyncio
import sys
sys.path.append('app')

from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.seed_data import seed

async def main():
    await connect_to_mongo()
    db = get_database()

    # Clear existing data
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.meals.delete_many({})
    print("✅ Database cleared!")

    # Seed new data
    print("\nSeeding new data...")
    await seed()

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
