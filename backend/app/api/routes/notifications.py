from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.services.auth_service import get_user_by_uid
from app.services.notification_service import (
    get_notifications,
    get_user_notifications,
    mark_as_read,
    send_notification
)

router = APIRouter()

async def get_current_profile(current_user: dict = Depends(get_current_user)):
    profile = await get_user_by_uid(current_user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.get("/")
async def get_all_notifications(profile: dict = Depends(get_current_profile)):
    if profile["role"] in ["admin", "staff"]:
        return await get_notifications(profile["uid"])
    else:
        return await get_user_notifications(
            uid=profile["uid"],
            department=profile["department"],
            class_name=profile["class_name"],
            batch=profile["batch"],
            role=profile["role"]
        )

@router.put("/{notification_id}/read")
async def read_notification(
    notification_id: str,
    profile: dict = Depends(get_current_profile)
):
    await mark_as_read(notification_id)
    return {"message": "Marked as read"}

@router.post("/")
async def create_notification(
    data: dict,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await send_notification(
        title=data["title"],
        message=data["message"],
        created_by=profile["uid"],
        type=data.get("type", "general"),
        target_department=data.get("target_department"),
        target_class=data.get("target_class"),
        target_batch=data.get("target_batch"),
        target_role=data.get("target_role")
    )