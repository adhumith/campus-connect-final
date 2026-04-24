from datetime import datetime
from bson import ObjectId
from app.db.mongodb import get_db
import os
import shutil

UPLOAD_DIR = "uploads/assignments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def create_assignment(data: dict, created_by: str) -> dict:
    db = get_db()
    assignment = {
        "title": data["title"],
        "description": data["description"],
        "department": data["department"],
        "class_name": data["class_name"],
        "batch": data["batch"],
        "deadline": data["deadline"],
        "created_by": created_by,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.assignments.insert_one(assignment)
    assignment["id"] = str(result.inserted_id)
    assignment["_id"] = str(result.inserted_id)
    return assignment

async def get_assignments(department: str, class_name: str, batch: str) -> list:
    db = get_db()
    query = {
        "department": department,
        "class_name": class_name,
        "batch": batch
    }
    assignments = await db.assignments.find(query).to_list(1000)
    for a in assignments:
        a["id"] = str(a["_id"])
        a["_id"] = str(a["_id"])
    return assignments

async def get_assignment_by_id(assignment_id: str) -> dict:
    db = get_db()
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if assignment:
        assignment["id"] = str(assignment["_id"])
        assignment["_id"] = str(assignment["_id"])
    return assignment

async def update_assignment(assignment_id: str, data: dict, uid: str, role: str) -> dict:
    db = get_db()
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        raise ValueError("Assignment not found")
    if role != "admin" and assignment["created_by"] != uid:
        raise PermissionError("Not authorized")
    data["updated_at"] = datetime.utcnow()
    await db.assignments.update_one({"_id": ObjectId(assignment_id)}, {"$set": data})
    return await get_assignment_by_id(assignment_id)

async def delete_assignment(assignment_id: str, uid: str, role: str) -> bool:
    db = get_db()
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        return False
    if role != "admin" and assignment["created_by"] != uid:
        raise PermissionError("Not authorized")
    await db.assignments.delete_one({"_id": ObjectId(assignment_id)})
    return True

async def submit_assignment(
    assignment_id: str,
    student_uid: str,
    rollno: str,
    file
) -> dict:
    db = get_db()

    # Check deadline
    assignment = await get_assignment_by_id(assignment_id)
    if not assignment:
        raise ValueError("Assignment not found")
    if datetime.utcnow() > assignment["deadline"]:
        raise ValueError("Deadline has passed")

    # Check already submitted
    existing = await db.submissions.find_one({
        "assignment_id": assignment_id,
        "student_uid": student_uid
    })
    if existing:
        raise ValueError("Already submitted")

    # Save file
    file_name = f"{datetime.utcnow().timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    submission = {
        "assignment_id": assignment_id,
        "student_uid": student_uid,
        "rollno": rollno,
        "file_url": f"/uploads/assignments/{file_name}",
        "file_name": file.filename,
        "submitted_at": datetime.utcnow()
    }
    result = await db.submissions.insert_one(submission)
    submission["id"] = str(result.inserted_id)
    submission["_id"] = str(result.inserted_id)
    return submission

async def get_submissions(assignment_id: str) -> list:
    db = get_db()
    submissions = await db.submissions.find(
        {"assignment_id": assignment_id}
    ).to_list(1000)
    for s in submissions:
        s["id"] = str(s["_id"])
        s["_id"] = str(s["_id"])
    return submissions