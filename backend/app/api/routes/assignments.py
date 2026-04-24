from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.core.security import get_current_user
from app.services.auth_service import get_user_by_uid
from app.schemas.assignment import AssignmentCreate
from app.services.assignment_service import (
    create_assignment,
    get_assignments,
    get_assignment_by_id,
    update_assignment,
    delete_assignment,
    submit_assignment,
    get_submissions
)

router = APIRouter()

async def get_current_profile(current_user: dict = Depends(get_current_user)):
    profile = await get_user_by_uid(current_user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.post("/")
async def create(
    data: AssignmentCreate,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await create_assignment(data.dict(), profile["uid"])

@router.get("/")
async def get_all(
    department: str = None,
    class_name: str = None,
    batch: str = None,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] in ["admin", "staff"]:
        d = department or profile["department"]
        c = class_name or profile["class_name"]
        b = batch or profile["batch"]
    else:
        d = profile["department"]
        c = profile["class_name"]
        b = profile["batch"]
    return await get_assignments(department=d, class_name=c, batch=b)

@router.get("/{assignment_id}")
async def get_one(
    assignment_id: str,
    profile: dict = Depends(get_current_profile)
):
    assignment = await get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.put("/{assignment_id}")
async def update(
    assignment_id: str,
    data: dict,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        return await update_assignment(assignment_id, data, profile["uid"], profile["role"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.delete("/{assignment_id}")
async def delete(
    assignment_id: str,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        deleted = await delete_assignment(assignment_id, profile["uid"], profile["role"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Assignment not found")
        return {"message": "Assignment deleted successfully"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/{assignment_id}/submit")
async def submit(
    assignment_id: str,
    file: UploadFile = File(...),
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can submit")
    if not profile.get("rollno"):
        raise HTTPException(status_code=400, detail="Student rollno not found")
    try:
        return await submit_assignment(
            assignment_id=assignment_id,
            student_uid=profile["uid"],
            rollno=profile["rollno"],
            file=file
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{assignment_id}/submissions")
async def get_all_submissions(
    assignment_id: str,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await get_submissions(assignment_id)