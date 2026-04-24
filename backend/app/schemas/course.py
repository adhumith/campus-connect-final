from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CourseCreate(BaseModel):
    title: str
    description: str
    department: str
    class_name: str
    batch: str

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    department: str
    class_name: str
    batch: str
    file_url: str
    file_name: str
    uploaded_by: str
    created_at: datetime
    updated_at: datetime