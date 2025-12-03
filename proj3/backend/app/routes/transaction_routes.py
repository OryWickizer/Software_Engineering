from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.dependencies import get_current_user
from app.models import (
    TransactionCreate,
    TransactionResponse,
    OrderHistoryResponse,
    TransactionType,
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate, current_user: dict = Depends(get_current_user)
):
    """
    Create a new transaction (purchase or swap).
    This is called when a buyer completes checkout.
    """
    db = get_database()

    # Verify the meal exists
    meal = await db.meals.find_one({"_id": ObjectId(transaction_data.meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    # Get seller info
    seller_id = str(meal["seller_id"])
    
    # Calculate amount for sales
    amount = None
    if transaction_data.transaction_type == TransactionType.SALE:
        amount = meal.get("sale_price")

    # Create transaction document
    transaction_doc = {
        "meal_id": transaction_data.meal_id,
        "meal_title": meal.get("title", "Unknown Meal"),
        "buyer_id": str(current_user["_id"]),
        "buyer_name": current_user.get("full_name", "Unknown Buyer"),
        "seller_id": seller_id,
        "transaction_type": transaction_data.transaction_type,
        "status": "completed",  # For now, auto-complete. Can add "pending" for swaps
        "amount": amount,
        "offered_meal_id": transaction_data.offered_meal_id,
        "message": transaction_data.message,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.transactions.insert_one(transaction_doc)
    transaction_doc["_id"] = result.inserted_id

    return TransactionResponse(
        id=str(transaction_doc["_id"]),
        meal_id=transaction_doc["meal_id"],
        buyer_id=transaction_doc["buyer_id"],
        seller_id=transaction_doc["seller_id"],
        transaction_type=transaction_doc["transaction_type"],
        status=transaction_doc["status"],
        amount=transaction_doc["amount"],
        offered_meal_id=transaction_doc.get("offered_meal_id"),
        message=transaction_doc.get("message"),
        created_at=transaction_doc["created_at"],
        updated_at=transaction_doc["updated_at"],
    )


@router.get("/my-orders", response_model=List[OrderHistoryResponse])
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """
    Get all orders/transactions for the current user (as buyer).
    Returns transactions with meal details.
    """
    db = get_database()

    orders = []
    cursor = db.transactions.find({"buyer_id": str(current_user["_id"])}).sort(
        "created_at", -1
    )

    async for transaction in cursor:
        # Get meal details
        meal = await db.meals.find_one({"_id": ObjectId(transaction["meal_id"])})
        
        # Get seller name if not in transaction
        seller_name = transaction.get("seller_name")
        if not seller_name:
            seller = await db.users.find_one({"_id": ObjectId(transaction["seller_id"])})
            seller_name = seller.get("full_name", "Unknown Seller") if seller else "Unknown Seller"
        
        order = OrderHistoryResponse(
            id=str(transaction["_id"]),
            transaction_id=str(transaction["_id"]),
            meal_id=transaction["meal_id"],
            meal_title=transaction.get("meal_title", meal.get("title") if meal else "Unknown Meal"),
            meal_cuisine=meal.get("cuisine_type") if meal else None,
            meal_photos=meal.get("photos", []) if meal else [],
            buyer_id=transaction["buyer_id"],
            seller_id=transaction["seller_id"],
            seller_name=seller_name,
            transaction_type=transaction["transaction_type"],
            status=transaction["status"],
            amount=transaction.get("amount"),
            offered_meal_id=transaction.get("offered_meal_id"),
            message=transaction.get("message"),
            created_at=transaction["created_at"],
            updated_at=transaction["updated_at"],
        )
        orders.append(order)

    return orders


@router.get("/my-sales", response_model=List[OrderHistoryResponse])
async def get_my_sales(current_user: dict = Depends(get_current_user)):
    """
    Get all transactions where the current user is the seller.
    """
    db = get_database()

    sales = []
    cursor = db.transactions.find({"seller_id": str(current_user["_id"])}).sort(
        "created_at", -1
    )

    async for transaction in cursor:
        # Get meal details
        meal = await db.meals.find_one({"_id": ObjectId(transaction["meal_id"])})
        
        # Get buyer name if not in transaction
        buyer_name = transaction.get("buyer_name")
        if not buyer_name:
            buyer = await db.users.find_one({"_id": ObjectId(transaction["buyer_id"])})
            buyer_name = buyer.get("full_name", "Unknown Buyer") if buyer else "Unknown Buyer"
        
        sale = OrderHistoryResponse(
            id=str(transaction["_id"]),
            transaction_id=str(transaction["_id"]),
            meal_id=transaction["meal_id"],
            meal_title=transaction.get("meal_title", meal.get("title") if meal else "Unknown Meal"),
            meal_cuisine=meal.get("cuisine_type") if meal else None,
            meal_photos=meal.get("photos", []) if meal else [],
            buyer_id=transaction["buyer_id"],
            seller_id=transaction["seller_id"],
            seller_name=buyer_name,  # In sales view, we show buyer name in seller_name field for consistency
            transaction_type=transaction["transaction_type"],
            status=transaction["status"],
            amount=transaction.get("amount"),
            offered_meal_id=transaction.get("offered_meal_id"),
            message=transaction.get("message"),
            created_at=transaction["created_at"],
            updated_at=transaction["updated_at"],
        )
        sales.append(sale)

    return sales


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str, current_user: dict = Depends(get_current_user)
):
    """Get a specific transaction by ID"""
    db = get_database()

    try:
        transaction = await db.transactions.find_one({"_id": ObjectId(transaction_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid transaction ID"
        )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    # Verify user is involved in the transaction
    if (
        transaction["buyer_id"] != str(current_user["_id"])
        and transaction["seller_id"] != str(current_user["_id"])
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this transaction",
        )

    return TransactionResponse(
        id=str(transaction["_id"]),
        meal_id=transaction["meal_id"],
        buyer_id=transaction["buyer_id"],
        seller_id=transaction["seller_id"],
        transaction_type=transaction["transaction_type"],
        status=transaction["status"],
        amount=transaction.get("amount"),
        offered_meal_id=transaction.get("offered_meal_id"),
        message=transaction.get("message"),
        created_at=transaction["created_at"],
        updated_at=transaction["updated_at"],
    )
