from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssignmentCreate(BaseModel):
    title: str
    description: str
    department: str
    class_name: str
    batch: str
    deadline: datetime

class AssignmentResponse(BaseModel):
    id: str
    title: str
    description: str
    department: str
    class_name: str
    batch: str
    deadline: datetime
    created_by: str
    created_at: datetime

class SubmissionResponse(BaseModel):
    id: str
    assignment_id: str
    student_uid: str
    rollno: str
    file_url: str
    file_name: str
    submitted_at: datetime