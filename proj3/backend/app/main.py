from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.meal_routes import router as meal_router
from pymongo import ASCENDING
from fastapi.responses import FileResponse, JSONResponse
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Taste Buddies API",
    description="A full-stack application with FastAPI, MongoDB, and React",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
)

if os.path.exists(os.path.join(frontend_path, "index.html")):
    app.mount(
        "/static",
        StaticFiles(directory=os.path.join(frontend_path, "assets")),
        name="static",
    )
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:

    @app.get("/")
    async def root_fallback():
        return JSONResponse(
            {"message": "Welcome to Taste Buddiez API (frontend not built)"}
        )


@app.get("/")
async def root():
    return FileResponse(os.path.join(frontend_path, "index.html"))


@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on application startup"""

    await connect_to_mongo()
    db = get_database()

    if db is not None:
        try:
            # User indexes
            await db.users.create_index([("email", ASCENDING)], unique=True)

            # Meal indexes
            await db.meals.create_index([("seller_id", ASCENDING)])
            await db.meals.create_index([("status", ASCENDING)])
            await db.meals.create_index([("cuisine_type", ASCENDING)])
            await db.meals.create_index([("created_at", ASCENDING)])

            # Verification token indexes
            await db.verification_tokens.create_index(
                [("expires_at", ASCENDING)], expireAfterSeconds=0
            )
            await db.verification_tokens.create_index([("email", ASCENDING)])

            # Review indexes
            await db.reviews.create_index([("meal_id", ASCENDING)])
            await db.reviews.create_index([("reviewer_id", ASCENDING)])
            await db.reviews.create_index([("seller_id", ASCENDING)])

            print("✅ Database indexes verified/created")
        except Exception as e:
            print(f"⚠️ Index creation note: {e}")


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    await close_mongo_connection()


# Include routersv
app.include_router(auth_router, tags=["Authentication"])
app.include_router(user_router)
app.include_router(meal_router)


# @app.get("/")
# async def root():
#    return {
#        "message": "Welcome to Taste Buddiez API",
#        "tagline": "Connecting neighbors through homemade meals",
#    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


def run():
    """Entry point for running the app as an installed package."""
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=5173, reload=True)
