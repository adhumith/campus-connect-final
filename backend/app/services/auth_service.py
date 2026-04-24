from datetime import datetime
from app.db.mongodb import get_db
from app.schemas.user import UserCreate

async def get_or_create_user(uid: str, email: str, user_data: dict) -> dict:
    db = get_db()
    user = await db.users.find_one({"uid": uid})
    if user:
        user["_id"] = str(user["_id"])
        return user
    return None

async def create_user(uid: str, email: str, data: UserCreate) -> dict:
    db = get_db()
    # Validate rollno for students
    if data.role == "student" and not data.rollno:
        raise ValueError("Roll number is required for students")
    new_user = {
        "uid": uid,
        "email": email,
        "full_name": data.full_name,
        "role": data.role,
        "department": data.department,
        "class_name": data.class_name,
        "batch": data.batch,
        "rollno": data.rollno,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(new_user)
    new_user["_id"] = str(new_user["_id"])
    return new_user

async def get_user_by_uid(uid: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"uid": uid})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def update_user(uid: str, data: dict) -> dict:
    db = get_db()
    data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"uid": uid}, {"$set": data})
    return await get_user_by_uid(uid)