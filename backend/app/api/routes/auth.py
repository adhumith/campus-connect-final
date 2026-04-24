from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import get_or_create_user, create_user, get_user_by_uid

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user["uid"]
    email = current_user["email"]
    existing = await get_or_create_user(uid, email, {})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = await create_user(uid, email, user_data)
    return user

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    user = await get_user_by_uid(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "uid": current_user["uid"], "email": current_user.get("email")}