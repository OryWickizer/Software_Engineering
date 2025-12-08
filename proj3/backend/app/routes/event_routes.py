from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import List

from ..models import NeighborhoodEventCreate, NeighborhoodEventResponse, EventDish
from ..database import get_database
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/events", tags=["Events"])


# Helper to serialize event doc
async def event_to_response(event: dict, db) -> NeighborhoodEventResponse:
    # Normalize dishes: ensure seller_id (and any ObjectId) become strings
    raw_dishes = event.get("dishes", []) or []
    processed_dishes = []
    for d in raw_dishes:
        if not isinstance(d, dict):
            # if stored as Pydantic or other object, try to convert
            try:
                d = dict(d)
            except Exception:
                d = {"title": str(d)}
        pd = d.copy()
        if pd.get("seller_id") is not None:
            try:
                pd["seller_id"] = str(pd["seller_id"])
            except Exception:
                pd["seller_id"] = pd.get("seller_id")
            # Try to resolve seller name from users collection
            seller_name = None
            try:
                try:
                    seller_user = await db.users.find_one({"_id": ObjectId(pd["seller_id"])})
                except Exception:
                    seller_user = await db.users.find_one({"_id": pd["seller_id"]})
                if seller_user:
                    seller_name = seller_user.get("full_name") or seller_user.get("email")
            except Exception:
                seller_name = None
            if seller_name:
                pd["seller_name"] = seller_name
        if pd.get("id") is not None:
            try:
                pd["id"] = str(pd["id"])
            except Exception:
                pd["id"] = pd.get("id")
        processed_dishes.append(pd)

    # Resolve attendee names (if possible) into list of objects {id, name}
    attendees_raw = event.get("attendees", []) or []
    attendees_out = []
    for a in attendees_raw:
        # attendee may be an ObjectId or string
        try:
            aid = str(a)
        except Exception:
            aid = a

        name = None
        try:
            # try to look up user by ObjectId
            user = None
            try:
                user = await db.users.find_one({"_id": ObjectId(aid)})
            except Exception:
                user = await db.users.find_one({"_id": aid})
            if user:
                name = user.get("full_name") or user.get("email")
        except Exception:
            name = None

        attendees_out.append({"id": aid, "name": name})

    return NeighborhoodEventResponse(
        id=str(event.get("_id")),
        title=event.get("title"),
        description=event.get("description"),
        neighborhood=event.get("neighborhood"),
        date=event.get("date"),
        location=event.get("location"),
        organizer_id=str(event.get("organizer_id")),
        organizer_name=event.get("organizer_name"),
        capacity=event.get("capacity"),
        attendees=attendees_out,
        dishes=processed_dishes,
        created_at=event.get("created_at"),
        updated_at=event.get("updated_at"),
    )


@router.get("/", response_model=List[NeighborhoodEventResponse])
async def list_events():
    db = get_database()
    events = await db.events.find().to_list(length=100)
    out = []
    for e in events:
        out.append(await event_to_response(e, db))
    return out


@router.post("/", response_model=NeighborhoodEventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(event: NeighborhoodEventCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    now = datetime.utcnow()
    event_doc = event.dict()
    event_doc.update({
        "organizer_id": current_user["_id"],
        "organizer_name": current_user.get("full_name") or current_user.get("email"),
        "attendees": [current_user["_id"]],
        "dishes": [],
        "created_at": now,
        "updated_at": None,
    })
    result = await db.events.insert_one(event_doc)
    event_doc["_id"] = result.inserted_id
    return await event_to_response(event_doc, db)


@router.get("/mine", response_model=List[NeighborhoodEventResponse])
async def my_events(current_user: dict = Depends(get_current_user)):
    """Return events the current user organized or joined."""
    db = get_database()
    user_id = current_user.get("_id")
    # Find events where organizer_id equals user_id or attendees contains user_id
    cursor = db.events.find({
        "$or": [
            {"organizer_id": user_id},
            {"attendees": user_id}
        ]
    })
    events = await cursor.to_list(length=200)
    out = []
    for e in events:
        out.append(await event_to_response(e, db))
    return out


@router.get("/{event_id}", response_model=NeighborhoodEventResponse)
async def get_event(event_id: str):
    db = get_database()
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid event ID")
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return await event_to_response(event, db)


@router.post("/{event_id}/join")
async def join_event(event_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid event ID")
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    attendees = event.get("attendees", [])
    if current_user["_id"] in attendees:
        return {"message": "Already joined"}
    if event.get("capacity") and len(attendees) >= event.get("capacity"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is full")
    attendees.append(current_user["_id"])
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"attendees": attendees, "updated_at": datetime.utcnow()}})
    return {"message": "Joined"}


@router.post("/{event_id}/unjoin")
async def unjoin_event(event_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid event ID")
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    # Prevent organizer from unjoining their own event
    if event.get("organizer_id") == current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organizer cannot leave their own event")
    
    attendees = event.get("attendees", [])
    if current_user["_id"] not in attendees:
        return {"message": "Not joined"}
    
    attendees.remove(current_user["_id"])
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"attendees": attendees, "updated_at": datetime.utcnow()}})
    return {"message": "Unjoined"}


@router.post("/{event_id}/dishes")
async def add_dish(event_id: str, dish: EventDish, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid event ID")
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    dish_doc = dish.dict()
    # Ensure seller_id is a JSON-serializable string
    seller_id = current_user.get("_id")
    try:
        seller_id_str = str(seller_id)
    except Exception:
        seller_id_str = seller_id
    # include a human-readable seller name if available
    seller_name = current_user.get("full_name") or current_user.get("email")
    dish_doc.update({"seller_id": seller_id_str, "seller_name": seller_name})
    # Ensure the dish has a string id for the client to reference
    if not dish_doc.get("id"):
        dish_doc["id"] = str(ObjectId())
    dishes = event.get("dishes", [])
    dishes.append(dish_doc)
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"dishes": dishes, "updated_at": datetime.utcnow()}})
    # Return a JSON-safe response
    return {"message": "Dish added", "dish": dish_doc}

