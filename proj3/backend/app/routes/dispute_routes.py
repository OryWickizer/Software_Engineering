from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.dependencies import get_current_user
from app.models import (
    DisputeCreate,
    DisputeUpdate,
    DisputeResponse,
    DisputeStatus,
    DisputeReason,
)

router = APIRouter(prefix="/api/disputes", tags=["disputes"])


@router.post("/", response_model=DisputeResponse, status_code=status.HTTP_201_CREATED)
async def create_dispute(
    dispute_data: DisputeCreate, current_user: dict = Depends(get_current_user)
):
    """
    Create a new dispute for a transaction.
    Buyers can file disputes when they don't receive the correct meal.
    """
    db = get_database()

    # Verify the meal exists
    meal = await db.meals.find_one({"_id": ObjectId(dispute_data.meal_id)})
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found"
        )

    # Verify the seller exists
    seller = await db.users.find_one({"_id": ObjectId(dispute_data.seller_id)})
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
        )

    # Check if dispute already exists for this transaction
    existing_dispute = await db.disputes.find_one(
        {"transaction_id": dispute_data.transaction_id}
    )
    if existing_dispute:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dispute already exists for this transaction",
        )

    # Create dispute document
    dispute_doc = {
        "transaction_id": dispute_data.transaction_id,
        "meal_id": dispute_data.meal_id,
        "meal_title": meal.get("title", "Unknown Meal"),
        "buyer_id": str(current_user["_id"]),
        "buyer_name": current_user.get("full_name", "Unknown Buyer"),
        "seller_id": dispute_data.seller_id,
        "seller_name": seller.get("full_name", "Unknown Seller"),
        "reason": dispute_data.reason,
        "description": dispute_data.description,
        "photos": dispute_data.photos,
        "status": DisputeStatus.PENDING,
        "admin_notes": None,
        "refund_amount": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "resolved_at": None,
    }

    result = await db.disputes.insert_one(dispute_doc)
    dispute_doc["_id"] = result.inserted_id

    # Return response
    return DisputeResponse(
        id=str(dispute_doc["_id"]),
        transaction_id=dispute_doc["transaction_id"],
        meal_id=dispute_doc["meal_id"],
        meal_title=dispute_doc["meal_title"],
        buyer_id=dispute_doc["buyer_id"],
        buyer_name=dispute_doc["buyer_name"],
        seller_id=dispute_doc["seller_id"],
        seller_name=dispute_doc["seller_name"],
        reason=dispute_doc["reason"],
        description=dispute_doc["description"],
        photos=dispute_doc["photos"],
        status=dispute_doc["status"],
        admin_notes=dispute_doc["admin_notes"],
        refund_amount=dispute_doc["refund_amount"],
        created_at=dispute_doc["created_at"],
        updated_at=dispute_doc["updated_at"],
        resolved_at=dispute_doc["resolved_at"],
    )


@router.get("/my-disputes", response_model=List[DisputeResponse])
async def get_my_disputes(current_user: dict = Depends(get_current_user)):
    """Get all disputes filed by the current user"""
    db = get_database()

    disputes = []
    cursor = db.disputes.find({"buyer_id": str(current_user["_id"])}).sort(
        "created_at", -1
    )

    async for dispute in cursor:
        disputes.append(
            DisputeResponse(
                id=str(dispute["_id"]),
                transaction_id=dispute["transaction_id"],
                meal_id=dispute["meal_id"],
                meal_title=dispute["meal_title"],
                buyer_id=dispute["buyer_id"],
                buyer_name=dispute["buyer_name"],
                seller_id=dispute["seller_id"],
                seller_name=dispute["seller_name"],
                reason=dispute["reason"],
                description=dispute["description"],
                photos=dispute.get("photos", []),
                status=dispute["status"],
                admin_notes=dispute.get("admin_notes"),
                refund_amount=dispute.get("refund_amount"),
                created_at=dispute["created_at"],
                updated_at=dispute["updated_at"],
                resolved_at=dispute.get("resolved_at"),
            )
        )

    return disputes


@router.get("/disputes-against-me", response_model=List[DisputeResponse])
async def get_disputes_against_me(current_user: dict = Depends(get_current_user)):
    """Get all disputes filed against the current user (as seller)"""
    db = get_database()

    disputes = []
    cursor = db.disputes.find({"seller_id": str(current_user["_id"])}).sort(
        "created_at", -1
    )

    async for dispute in cursor:
        disputes.append(
            DisputeResponse(
                id=str(dispute["_id"]),
                transaction_id=dispute["transaction_id"],
                meal_id=dispute["meal_id"],
                meal_title=dispute["meal_title"],
                buyer_id=dispute["buyer_id"],
                buyer_name=dispute["buyer_name"],
                seller_id=dispute["seller_id"],
                seller_name=dispute["seller_name"],
                reason=dispute["reason"],
                description=dispute["description"],
                photos=dispute.get("photos", []),
                status=dispute["status"],
                admin_notes=dispute.get("admin_notes"),
                refund_amount=dispute.get("refund_amount"),
                created_at=dispute["created_at"],
                updated_at=dispute["updated_at"],
                resolved_at=dispute.get("resolved_at"),
            )
        )

    return disputes


@router.get("/{dispute_id}", response_model=DisputeResponse)
async def get_dispute(
    dispute_id: str, current_user: dict = Depends(get_current_user)
):
    """Get a specific dispute by ID"""
    db = get_database()

    try:
        dispute = await db.disputes.find_one({"_id": ObjectId(dispute_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid dispute ID"
        )

    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found"
        )

    # Verify user is involved in the dispute
    if (
        dispute["buyer_id"] != str(current_user["_id"])
        and dispute["seller_id"] != str(current_user["_id"])
        and current_user.get("role") != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this dispute",
        )

    return DisputeResponse(
        id=str(dispute["_id"]),
        transaction_id=dispute["transaction_id"],
        meal_id=dispute["meal_id"],
        meal_title=dispute["meal_title"],
        buyer_id=dispute["buyer_id"],
        buyer_name=dispute["buyer_name"],
        seller_id=dispute["seller_id"],
        seller_name=dispute["seller_name"],
        reason=dispute["reason"],
        description=dispute["description"],
        photos=dispute.get("photos", []),
        status=dispute["status"],
        admin_notes=dispute.get("admin_notes"),
        refund_amount=dispute.get("refund_amount"),
        created_at=dispute["created_at"],
        updated_at=dispute["updated_at"],
        resolved_at=dispute.get("resolved_at"),
    )


@router.put("/{dispute_id}", response_model=DisputeResponse)
async def update_dispute(
    dispute_id: str,
    dispute_update: DisputeUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update dispute status (admin only).
    Admins can resolve disputes and issue refunds.
    """
    db = get_database()

    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update disputes",
        )

    try:
        dispute = await db.disputes.find_one({"_id": ObjectId(dispute_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid dispute ID"
        )

    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found"
        )

    # Update dispute
    update_data = {
        "status": dispute_update.status,
        "updated_at": datetime.utcnow(),
    }

    if dispute_update.admin_notes:
        update_data["admin_notes"] = dispute_update.admin_notes

    if dispute_update.refund_amount is not None:
        update_data["refund_amount"] = dispute_update.refund_amount

    if dispute_update.status in [DisputeStatus.RESOLVED, DisputeStatus.REFUNDED]:
        update_data["resolved_at"] = datetime.utcnow()

    await db.disputes.update_one({"_id": ObjectId(dispute_id)}, {"$set": update_data})

    # Get updated dispute
    updated_dispute = await db.disputes.find_one({"_id": ObjectId(dispute_id)})

    return DisputeResponse(
        id=str(updated_dispute["_id"]),
        transaction_id=updated_dispute["transaction_id"],
        meal_id=updated_dispute["meal_id"],
        meal_title=updated_dispute["meal_title"],
        buyer_id=updated_dispute["buyer_id"],
        buyer_name=updated_dispute["buyer_name"],
        seller_id=updated_dispute["seller_id"],
        seller_name=updated_dispute["seller_name"],
        reason=updated_dispute["reason"],
        description=updated_dispute["description"],
        photos=updated_dispute.get("photos", []),
        status=updated_dispute["status"],
        admin_notes=updated_dispute.get("admin_notes"),
        refund_amount=updated_dispute.get("refund_amount"),
        created_at=updated_dispute["created_at"],
        updated_at=updated_dispute["updated_at"],
        resolved_at=updated_dispute.get("resolved_at"),
    )
