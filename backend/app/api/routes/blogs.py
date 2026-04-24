from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from app.core.security import get_current_user
from app.services.auth_service import get_user_by_uid
from app.services.blog_service import (
    create_blog,
    get_blogs,
    delete_blog,
    get_all_clubs,
    create_club,
    delete_club
)

router = APIRouter()

async def get_current_profile(current_user: dict = Depends(get_current_user)):
    profile = await get_user_by_uid(current_user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

# ── Club routes ──────────────────────────────────────────
@router.get("/clubs")
async def get_clubs(profile: dict = Depends(get_current_profile)):
    return await get_all_clubs()

@router.post("/clubs")
async def add_club(
    data: dict,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create clubs")
    return await create_club(data["name"])

@router.delete("/clubs/{club_id}")
async def remove_club(
    club_id: str,
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete clubs")
    await delete_club(club_id)
    return {"message": "Club deleted successfully"}

# ── Blog routes ──────────────────────────────────────────
@router.get("/")
async def get_all_blogs(
    club: Optional[str] = None,
    profile: dict = Depends(get_current_profile)
):
    return await get_blogs(club=club)

@router.post("/")
async def create_new_blog(
    title: str = Form(...),
    description: str = Form(...),
    club: str = Form(...),
    image: Optional[UploadFile] = File(None),
    profile: dict = Depends(get_current_profile)
):
    try:
        return await create_blog(
            title=title,
            description=description,
            club=club,
            created_by=profile["uid"],
            author_name=profile["full_name"],
            file=image
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{blog_id}")
async def delete_blog_post(
    blog_id: str,
    profile: dict = Depends(get_current_profile)
):
    try:
        deleted = await delete_blog(blog_id, profile["uid"], profile["role"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Blog not found")
        return {"message": "Blog deleted successfully"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))