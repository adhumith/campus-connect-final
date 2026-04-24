from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "general"

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    created_by: str
    is_read: bool = False
    created_at: datetime