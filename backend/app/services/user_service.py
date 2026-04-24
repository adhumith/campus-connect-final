from datetime import datetime
from app.db.mongodb import get_db
from app.schemas.user import UserCreate
import firebase_admin
import firebase_admin.auth as firebase_auth
import pandas as pd
import io

async def create_user_by_admin(data: UserCreate) -> dict:
    db = get_db()

    if data.role == "student" and not data.rollno:
        raise ValueError("Roll number is required for students")

    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise ValueError("User already exists")

    try:
        firebase_user = firebase_auth.get_user_by_email(data.email)
        uid = firebase_user.uid
    except firebase_admin.auth.UserNotFoundError:
        firebase_user = firebase_auth.create_user(
            email=data.email,
            password="Welcome@1234",
            display_name=data.full_name
        )
        uid = firebase_user.uid

    new_user = {
        "uid": uid,
        "email": data.email,
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

async def get_all_users(role: str = None, department: str = None) -> list:
    db = get_db()
    query = {}
    if role:
        query["role"] = role
    if department:
        query["department"] = department
    users = await db.users.find(query).to_list(1000)
    for user in users:
        user["_id"] = str(user["_id"])
    return users

async def get_user_by_id(uid: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"uid": uid})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def update_user_by_admin(uid: str, data: dict) -> dict:
    db = get_db()
    data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"uid": uid}, {"$set": data})
    return await get_user_by_id(uid)

async def delete_user_by_admin(uid: str):
    db = get_db()
    try:
        firebase_auth.delete_user(uid)
    except Exception:
        pass
    await db.users.delete_one({"uid": uid})

async def bulk_upload_users(file) -> dict:
    db = get_db()
    contents = await file.read()

    if file.filename.endswith('.csv'):
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    else:
        df = pd.read_excel(io.BytesIO(contents))

    required_columns = ["email", "full_name", "role", "department", "class_name", "batch"]
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")

    success = 0
    failed = []

    for _, row in df.iterrows():
        try:
            user_data = UserCreate(
                email=row["email"],
                full_name=row["full_name"],
                role=row["role"],
                department=row["department"],
                class_name=row["class_name"],
                batch=row["batch"],
                rollno=str(row["rollno"]) if "rollno" in row and pd.notna(row["rollno"]) else None
            )
            await create_user_by_admin(user_data)
            success += 1
        except Exception as e:
            failed.append({"email": row.get("email", "unknown"), "error": str(e)})

    return {
        "success": success,
        "failed": len(failed),
        "errors": failed
    }