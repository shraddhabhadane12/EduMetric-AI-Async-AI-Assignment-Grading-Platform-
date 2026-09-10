from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# DB session dependency
from app.db.session import get_db

# DB models
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.user import User

# Pydantic schemas
from app.schemas.assignment import AssignmentCreate, AssignmentResponse
from app.schemas.submission import SubmissionCreate, SubmissionResponse

# Auth & RBAC
from app.core.dependencies import get_current_user
from app.core.rbac import require_teacher, require_student


# Create router for assignment-related endpoints
router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)

# TEACHER → CREATE ASSIGNMENT

@router.post(
    "",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_assignment(
    data: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    """
    Teacher creates an assignment.

    - Only users with role = teacher can access
    - Takes structured assignment data (already parsed text)
    - Saves assignment into database
    """

    # Create Assignment ORM object
    assignment = Assignment(
        teacher_id = int(current_user["sub"]),   # logged-in teacher
        title=data.title,
        aim_ref=data.aim_ref,
        objectives_ref=data.objectives_ref,
        code_ref=data.code_ref,
        conclusion_ref=data.conclusion_ref,
        max_marks=data.max_marks,
    )

    # Save to DB
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    # Return saved assignment
    return assignment


# STUDENT → SUBMIT ASSIGNMENT

@router.post(
    "/{assignment_id}/submit",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_assignment(
    assignment_id: int,
    data: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Student submits an assignment.

    - Only users with role = student can access
    - Assignment must exist and be active
    - Missing sections are allowed (0 marks later)
    """

    # Check if assignment exists and is active
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()

    if not assignment or not assignment.is_active:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    # Create Submission ORM object
    submission = Submission(
        assignment_id=assignment_id,
        student_id=int(current_user["sub"]),   # logged-in student
        aim_ans=data.aim_ans,
        objectives_ans=data.objectives_ans,
        code_ans=data.code_ans,
        conclusion_ans=data.conclusion_ans,
    )

    # Save submission to DB
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # Return saved submission
    return submission


# GET ALL ASSIGNMENTS (ANY USER)

@router.get(
    "",
    response_model=list[AssignmentResponse],
)
async def list_assignments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all active assignments.

    - Any authenticated user (teacher or student)
    - Returns only active assignments
    """

    # Fetch active assignments
    result = await db.execute(
        select(Assignment).where(Assignment.is_active == True)
    )
    assignments = result.scalars().all()

    return assignments
