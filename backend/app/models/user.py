from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserModel(BaseModel):
    uid: str  # Firebase UID
    email: EmailStr
    full_name: str
    role: str  # student, staff, admin
    department: str
    class_name: str
    batch: str
    rollno: Optional[str] = None  # Required for students
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()