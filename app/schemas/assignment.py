from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# REQUEST SCHEMA 

class AssignmentCreate(BaseModel):
    """
    Used when teacher creates assignment
    (after PDF/text is already parsed)
    """
    title: str

    aim_ref: Optional[str] = ""
    objectives_ref: Optional[str] = ""
    code_ref: Optional[str] = ""
    conclusion_ref: Optional[str] = ""

    max_marks: float = 10


# RESPONSE SCHEMA 

class AssignmentResponse(BaseModel):
    id: int
    teacher_id: int

    title: str

    aim_ref: Optional[str]
    objectives_ref: Optional[str]
    code_ref: Optional[str]
    conclusion_ref: Optional[str]

    max_marks: float
    is_active: bool

    created_at: datetime

    class Config:
        from_attributes = True
