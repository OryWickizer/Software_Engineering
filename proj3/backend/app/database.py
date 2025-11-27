from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "myapp")

client = None
database = None


async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(MONGODB_URL, server_api=ServerApi("1"))
    database = client[DATABASE_NAME]
    print(f"Connected to MongoDB at {MONGODB_URL}")


async def close_mongo_connection():
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return database
