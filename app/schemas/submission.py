from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# REQUEST SCHEMA 

class SubmissionCreate(BaseModel):
    """
    Used when student submits assignment
    (after PDF/text is already parsed)
    """
    aim_ans: Optional[str] = ""
    objectives_ans: Optional[str] = ""
    code_ans: Optional[str] = ""
    conclusion_ans: Optional[str] = ""


# RESPONSE SCHEMA 

class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int

    aim_ans: Optional[str]
    objectives_ans: Optional[str]
    code_ans: Optional[str]
    conclusion_ans: Optional[str]

    marks_obtained: Optional[float]
    feedback: Optional[str]

    status: str

    submitted_at: datetime
    evaluated_at: Optional[datetime]

    class Config:
        from_attributes = True
