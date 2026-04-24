from datetime import datetime
from bson import ObjectId
from app.db.mongodb import get_db, get_gridfs
from app.db.redis import get_redis
import json
import io

async def upload_course_material(
    title: str,
    description: str,
    department: str,
    class_name: str,
    batch: str,
    uploaded_by: str,
    file
) -> dict:
    db = get_db()
    gridfs = get_gridfs()

    # Read file content
    file_content = await file.read()

    # Upload to GridFS
    file_id = await gridfs.upload_from_stream(
        file.filename,
        io.BytesIO(file_content),
        metadata={
            "content_type": file.content_type,
            "department": department,
            "class_name": class_name,
            "batch": batch
        }
    )

    course = {
        "title": title,
        "description": description,
        "department": department,
        "class_name": class_name,
        "batch": batch,
        "file_id": str(file_id),
        "file_name": file.filename,
        "file_url": f"/api/files/{str(file_id)}",
        "uploaded_by": uploaded_by,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.courses.insert_one(course)
    course["id"] = str(result.inserted_id)
    course["_id"] = str(result.inserted_id)

    redis = get_redis()
    if redis:
        await redis.delete(f"courses:{department}:{class_name}:{batch}")

    return course

async def get_courses(department: str, class_name: str, batch: str) -> list:
    db = get_db()
    redis = get_redis()

    cache_key = f"courses:{department}:{class_name}:{batch}"

    if redis:
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

    query = {
        "department": department,
        "class_name": class_name,
        "batch": batch
    }
    courses = await db.courses.find(query).to_list(1000)
    for course in courses:
        course["id"] = str(course["_id"])
        course["_id"] = str(course["_id"])

    if redis:
        await redis.setex(cache_key, 300, json.dumps(courses, default=str))

    return courses

async def delete_course(course_id: str, uid: str, role: str) -> bool:
    db = get_db()
    gridfs = get_gridfs()

    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        return False

    if role != "admin" and course["uploaded_by"] != uid:
        raise PermissionError("Not authorized to delete this material")

    # Delete file from GridFS
    if "file_id" in course:
        try:
            await gridfs.delete(ObjectId(course["file_id"]))
        except Exception:
            pass

    await db.courses.delete_one({"_id": ObjectId(course_id)})

    redis = get_redis()
    if redis:
        await redis.delete(
            f"courses:{course['department']}:{course['class_name']}:{course['batch']}"
        )
    return True

async def update_course(course_id: str, data: dict, uid: str, role: str) -> dict:
    db = get_db()
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise ValueError("Course not found")
    if role != "admin" and course["uploaded_by"] != uid:
        raise PermissionError("Not authorized to update this material")

    data["updated_at"] = datetime.utcnow()
    await db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": data})

    updated = await db.courses.find_one({"_id": ObjectId(course_id)})
    updated["id"] = str(updated["_id"])
    updated["_id"] = str(updated["_id"])
    return updated