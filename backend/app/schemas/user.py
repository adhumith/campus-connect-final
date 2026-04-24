from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    department: str
    class_name: str
    batch: str
    rollno: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    class_name: Optional[str] = None
    batch: Optional[str] = None
    rollno: Optional[str] = None

class UserResponse(BaseModel):
    uid: str
    email: str
    full_name: str
    role: str
    department: str
    class_name: str
    batch: str
    rollno: Optional[str] = None
    is_active: bool