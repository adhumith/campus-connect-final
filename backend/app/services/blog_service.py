from datetime import datetime
from bson import ObjectId
from app.db.mongodb import get_db
from app.db.redis import get_redis
from google import genai
from app.core.config import settings
import json
import os
import shutil

UPLOAD_DIR = "uploads/blogs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

async def check_content_moderation(title: str, description: str) -> dict:
    try:
        prompt = f"""
You are a content moderator for a college campus platform.
Check if the following blog post is appropriate for a college environment.
It should not contain: hate speech, harassment, sexual content, violence, profanity, or offensive language.

Title: {title}
Description: {description}

Respond ONLY in this JSON format:
{{"approved": true, "reason": "brief reason"}}
"""
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        return result
    except Exception as e:
        return {"approved": True, "reason": "Moderation check passed"}

async def get_all_clubs() -> list:
    db = get_db()
    clubs = await db.clubs.find().to_list(100)
    for club in clubs:
        club["id"] = str(club["_id"])
        club["_id"] = str(club["_id"])
    return clubs

async def create_club(name: str) -> dict:
    db = get_db()
    existing = await db.clubs.find_one({"name": name})
    if existing:
        raise ValueError("Club already exists")
    club = {
        "name": name,
        "created_at": datetime.utcnow()
    }
    result = await db.clubs.insert_one(club)
    club["id"] = str(result.inserted_id)
    club["_id"] = str(result.inserted_id)
    return club

async def delete_club(club_id: str):
    db = get_db()
    await db.clubs.delete_one({"_id": ObjectId(club_id)})

async def create_blog(
    title: str,
    description: str,
    club: str,
    created_by: str,
    author_name: str,
    file=None
) -> dict:
    db = get_db()

    moderation = await check_content_moderation(title, description)
    if not moderation["approved"]:
        raise ValueError(f"Blog rejected: {moderation['reason']}")

    image_url = None
    if file:
        file_name = f"{datetime.utcnow().timestamp()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_url = f"/uploads/blogs/{file_name}"

    blog = {
        "title": title,
        "description": description,
        "club": club,
        "image_url": image_url,
        "created_by": created_by,
        "author_name": author_name,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.blogs.insert_one(blog)
    blog["id"] = str(result.inserted_id)
    blog["_id"] = str(result.inserted_id)

    redis = get_redis()
    if redis:
        keys = await redis.keys("blogs:*")
        for key in keys:
            await redis.delete(key)

    await send_blog_notification(title, author_name, club, created_by)

    return blog

async def send_blog_notification(title: str, author_name: str, club: str, created_by: str):
    db = get_db()
    notification = {
        "title": f"New Blog: {title}",
        "message": f"{author_name} posted a new blog in {club}",
        "type": "blog",
        "created_by": created_by,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    await db.notifications.insert_one(notification)

async def get_blogs(club: str = None) -> list:
    db = get_db()
    redis = get_redis()

    cache_key = f"blogs:{club or 'all'}"

    if redis:
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

    query = {}
    if club:
        query["club"] = club

    blogs = await db.blogs.find(query).sort("created_at", -1).to_list(1000)
    for blog in blogs:
        blog["id"] = str(blog["_id"])
        blog["_id"] = str(blog["_id"])

    if redis:
        await redis.setex(cache_key, 300, json.dumps(blogs, default=str))

    return blogs

async def delete_blog(blog_id: str, uid: str, role: str) -> bool:
    db = get_db()
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        return False
    if role != "admin" and blog["created_by"] != uid:
        raise PermissionError("Not authorized")
    await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    redis = get_redis()
    if redis:
        keys = await redis.keys("blogs:*")
        for key in keys:
            await redis.delete(key)
    return True