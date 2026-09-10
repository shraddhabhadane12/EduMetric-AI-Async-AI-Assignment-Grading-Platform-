from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.db.session import get_db
from app.services.grading_service import grade_submission
from app.models.submission import Submission
from app.models.assignment import Assignment
from app.core.rbac import require_teacher

router = APIRouter(
    prefix="/grading",
    tags=["Grading"]
)

@router.post(
    "/assignments/{assignment_id}/submissions/{submission_id}",
    status_code=status.HTTP_200_OK
)
async def grade_submission_endpoint(
    assignment_id: int,
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    teacher=Depends(require_teacher),
):
    # 1️ Fetch assignment (must belong to teacher)
    assignment_stmt = select(Assignment).where(
        Assignment.id == assignment_id,
        Assignment.teacher_id == int(teacher["sub"]),
        Assignment.is_active == True
    )
    assignment_result = await db.execute(assignment_stmt)
    assignment = assignment_result.scalar_one_or_none()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found or access denied"
        )

    # 2️ Fetch submission
    submission_stmt = select(Submission).where(
        Submission.id == submission_id,
        Submission.assignment_id == assignment_id
    )
    submission_result = await db.execute(submission_stmt)
    submission = submission_result.scalar_one_or_none()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    # 3️ Prevent re-grading
    if submission.status == "EVALUATED":
        raise HTTPException(
            status_code=400,
            detail="Submission already evaluated"
        )

    # 4️ Grade using service
    result = grade_submission(assignment, submission)

    # 5️ Update submission
    submission.marks_obtained = result["marks_obtained"]
    submission.feedback = result["feedback"]
    submission.status = "EVALUATED"
    submission.evaluated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(submission)

    return {
        "submission_id": submission.id,
        "marks_obtained": submission.marks_obtained,
        "feedback": submission.feedback,
        "status": submission.status,
    }

