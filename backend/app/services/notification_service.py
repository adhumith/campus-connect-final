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

async def send_notification(
    title: str,
    message: str,
    created_by: str,
    type: str = "general",
    target_department: str = None,
    target_class: str = None,
    target_batch: str = None,
    target_role: str = None
) -> dict:
    db = get_db()

    # Build target info
    target = {}
    if target_department:
        target["department"] = target_department
    if target_class:
        target["class_name"] = target_class
    if target_batch:
        target["batch"] = target_batch
    if target_role:
        target["role"] = target_role

    notification = {
        "title": title,
        "message": message,
        "type": type,
        "created_by": created_by,
        "target": target,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    result = await db.notifications.insert_one(notification)
    notification["id"] = str(result.inserted_id)
    notification["_id"] = str(result.inserted_id)
    return notification

async def get_user_notifications(uid: str, department: str, class_name: str, batch: str, role: str) -> list:
    db = get_db()

    # Get notifications targeted to this user
    query = {
        "$or": [
            {"target": {}},  # broadcast to all
            {"target.department": department},
            {"target.class_name": class_name},
            {"target.batch": batch},
            {"target.role": role},
            {
                "target.department": department,
                "target.class_name": class_name,
                "target.batch": batch
            }
        ]
    }

    notifications = await db.notifications.find(query).sort(
        "created_at", -1
    ).to_list(100)

    for n in notifications:
        n["id"] = str(n["_id"])
        n["_id"] = str(n["_id"])
    return notifications