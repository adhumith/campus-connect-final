from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlogCreate(BaseModel):
    title: str
    description: str
    club: str

class BlogResponse(BaseModel):
    id: str
    title: str
    description: str
    club: str
    image_url: Optional[str] = None
    created_by: str
    author_name: str
    created_at: datetime

class ClubCreate(BaseModel):
    name: str

class ClubResponse(BaseModel):
    id: str
    name: str
    created_at: datetime