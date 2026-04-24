from datetime import datetime
from bson import ObjectId
from app.db.mongodb import get_db

async def get_notifications(uid: str) -> list:
    db = get_db()
    notifications = await db.notifications.find().sort(
        "created_at", -1
    ).to_list(100)
    for n in notifications:
        n["id"] = str(n["_id"])
        n["_id"] = str(n["_id"])
    return notifications

async def mark_as_read(notification_id: str):
    db = get_db()
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}}
    )

async def send_notification(title: str, message: str, created_by: str, type: str = "general"):
    db = get_db()
    notification = {
        "title": title,
        "message": message,
        "type": type,
        "created_by": created_by,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    result = await db.notifications.insert_one(notification)
    notification["id"] = str(result.inserted_id)
    return notification