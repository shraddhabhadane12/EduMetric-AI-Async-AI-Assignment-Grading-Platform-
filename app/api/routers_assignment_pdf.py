from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.user import User

from app.core.rbac import require_student, require_teacher
from sqlalchemy import select
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.text_parser import parse_sections


router = APIRouter(
    prefix="/assignments",
    tags=["Assignments (PDF)"]
)

# TEACHER → CREATE ASSIGNMENT VIA PDF

@router.post(
    "/upload-pdf",
    status_code=status.HTTP_201_CREATED,
)
async def create_assignment_from_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """
    Teacher uploads assignment PDF.

    Flow:
    PDF -> extract text -> parse sections -> store in DB
    """

    # 1️ Extract plain text from PDF
    raw_text = await extract_text_from_pdf(file)

    # 2️ Parse sections (Aim, Objectives, Code, Conclusion)
    sections = parse_sections(raw_text)

    # 3️ Auto-generate title (simple & safe)
    title = raw_text.splitlines()[0][:255]

    # 4️ Create Assignment DB object
    assignment = Assignment(
        teacher_id=int(current_user["sub"]),
        title=title,
        aim_ref=sections["aim"],
        objectives_ref=sections["objectives"],
        code_ref=sections["code"],
        conclusion_ref=sections["conclusion"],
    )

    # 5️ Save to database
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    return {
        "message": "Assignment created from PDF",
        "assignment_id": assignment.id
    }

# STUDENT → SUBMIT ASSIGNMENT VIA PDF

@router.post(
    "/{assignment_id}/submit-pdf",
    status_code=status.HTTP_201_CREATED,
)
async def submit_assignment_from_pdf(
    assignment_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Student uploads assignment answer as PDF.

    Flow:
    PDF -> extract text -> parse sections -> store submission
    """

    # 1 Check assignment exists and is active
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()

    if not assignment or not assignment.is_active:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    # 2 Extract plain text from PDF
    raw_text = await extract_text_from_pdf(file)

    # 3 Parse sections
    sections = parse_sections(raw_text)

    # 4 Create Submission DB object
    submission = Submission(
        assignment_id=assignment_id,
        student_id=int(current_user["sub"]),
        aim_ans=sections["aim"],
        objectives_ans=sections["objectives"],
        code_ans=sections["code"],
        conclusion_ans=sections["conclusion"],
        status="PENDING",
    )

    # 5 Save to DB
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    return {
        "message": "Submission created from PDF",
        "submission_id": submission.id
    }


# STUDENT → EXTRACT PDF FOR PREVIEW (VERIFICATION)

@router.post(
    "/extract-pdf-preview",
    status_code=status.HTTP_200_OK,
)
async def extract_pdf_for_preview(
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
):
    """
    Student uploads PDF to preview extracted text before submitting.
    
    Flow:
    PDF -> extract text -> parse sections -> return for verification
    Does NOT save to database.
    """

    # Extract plain text from PDF
    raw_text = await extract_text_from_pdf(file)

    # Parse sections
    sections = parse_sections(raw_text)

    return {
        "aim_ans": sections["aim"],
        "objectives_ans": sections["objectives"],
        "code_ans": sections["code"],
        "conclusion_ans": sections["conclusion"],
    }