from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CourseModel(BaseModel):
    title: str
    description: str
    department: str
    class_name: str
    batch: str
    file_url: str
    file_name: str
    uploaded_by: str  # uid of staff
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()