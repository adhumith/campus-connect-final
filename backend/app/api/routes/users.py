from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.core.security import get_current_user
from app.services.auth_service import get_user_by_uid
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import (
    create_user_by_admin,
    get_all_users,
    get_user_by_id,
    update_user_by_admin,
    delete_user_by_admin,
    bulk_upload_users
)

router = APIRouter()

async def require_admin(current_user: dict = Depends(get_current_user)):
    profile = await get_user_by_uid(current_user["uid"])
    if not profile or profile["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return profile

@router.post("/bulk-upload")
async def bulk_upload(
    file: UploadFile = File(...),
    admin: dict = Depends(require_admin)
):
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx or .csv files allowed")
    result = await bulk_upload_users(file)
    return result

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    admin: dict = Depends(require_admin)
):
    return await create_user_by_admin(user_data)

@router.get("/", response_model=list[UserResponse])
async def get_users(
    role: str = None,
    department: str = None,
    admin: dict = Depends(require_admin)
):
    return await get_all_users(role=role, department=department)

@router.get("/{uid}", response_model=UserResponse)
async def get_user(
    uid: str,
    admin: dict = Depends(require_admin)
):
    user = await get_user_by_id(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{uid}", response_model=UserResponse)
async def update_user(
    uid: str,
    user_data: dict,
    admin: dict = Depends(require_admin)
):
    return await update_user_by_admin(uid, user_data)

@router.delete("/{uid}")
async def delete_user(
    uid: str,
    admin: dict = Depends(require_admin)
):
    await delete_user_by_admin(uid)
    return {"message": "User deleted successfully"}