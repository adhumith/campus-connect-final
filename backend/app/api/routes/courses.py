from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.core.security import get_current_user
from app.services.auth_service import get_user_by_uid
from app.services.course_service import (
    upload_course_material,
    get_courses,
    delete_course,
    update_course
)

router = APIRouter()

async def get_current_profile(current_user: dict = Depends(get_current_user)):
    profile = await get_user_by_uid(current_user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.post("/")
async def upload_material(
    title: str = Form(...),
    description: str = Form(...),
    department: str = Form(...),
    class_name: str = Form(...),
    batch: str = Form(...),
    file: UploadFile = File(...),
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Only staff or admin can upload materials")
    course = await upload_course_material(
        title=title,
        description=description,
        department=department,
        class_name=class_name,
        batch=batch,
        uploaded_by=profile["uid"],
        file=file
    )
    return course

@router.get("/")
async def get_materials(
    profile: dict = Depends(get_current_profile)
):
    # Students only see their own dept/class/batch
    if profile["role"] == "student":
        courses = await get_courses(
            department=profile["department"],
            class_name=profile["class_name"],
            batch=profile["batch"]
        )
    else:
        # Staff and admin can filter
        courses = await get_courses(
            department=profile["department"],
            class_name=profile["class_name"],
            batch=profile["batch"]
        )
    return courses

@router.get("/filter")
async def get_materials_filtered(
    department: str,
    class_name: str,
    batch: str,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await get_courses(department=department, class_name=class_name, batch=batch)

@router.delete("/{course_id}")
async def delete_material(
    course_id: str,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        deleted = await delete_course(course_id, profile["uid"], profile["role"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course deleted successfully"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.put("/{course_id}")
async def update_material(
    course_id: str,
    data: dict,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        return await update_course(course_id, data, profile["uid"], profile["role"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))