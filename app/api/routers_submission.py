from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.submission import Submission
from app.models.assignment import Assignment
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.rbac import require_teacher, require_student

router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"]
)

@router.get(
    "/my-submissions",
    status_code=status.HTTP_200_OK
)
async def get_my_submissions(
    db: AsyncSession = Depends(get_db),
    student=Depends(require_student),
):
    """
    Student endpoint to get all their own submissions.
    """
    student_id = int(student["sub"])
    
    # Fetch all submissions by this student
    stmt = select(Submission).where(
        Submission.student_id == student_id
    ).order_by(Submission.submitted_at.desc())
    
    result = await db.execute(stmt)
    submissions = result.scalars().all()
    
    # Format response
    submissions_list = []
    for submission in submissions:
        submission_data = {
            "id": submission.id,
            "assignment_id": submission.assignment_id,
            "submitted_at": submission.submitted_at,
            "status": submission.status,
            "marks_obtained": submission.marks_obtained if submission.status == "EVALUATED" else None,
            "feedback": submission.feedback if submission.status == "EVALUATED" else None,
        }
        submissions_list.append(submission_data)
    
    return submissions_list

@router.get(
    "/assignment/{assignment_id}",
    status_code=status.HTTP_200_OK
)
async def get_assignment_submissions(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    teacher=Depends(require_teacher),
):
    """
    Teacher endpoint to get all submissions for a specific assignment.
    Returns student email, marks, feedback, and status.
    """
    # 1 Verify teacher owns this assignment
    assignment_stmt = select(Assignment).where(
        Assignment.id == assignment_id,
        Assignment.teacher_id == int(teacher["sub"])
    )
    assignment_result = await db.execute(assignment_stmt)
    assignment = assignment_result.scalar_one_or_none()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found or access denied"
        )

    # 2 Fetch all submissions for this assignment with student info
    submissions_stmt = select(Submission, User).join(
        User, Submission.student_id == User.id
    ).where(
        Submission.assignment_id == assignment_id
    ).order_by(Submission.submitted_at.desc())

    result = await db.execute(submissions_stmt)
    submissions_with_users = result.all()

    # 3 Format response
    submissions_list = []
    for submission, student in submissions_with_users:
        submissions_list.append({
            "submission_id": submission.id,
            "student_id": student.id,
            "student_email": student.email,
            "student_name": student.email.split("@")[0],  # Use email prefix as name
            "submitted_at": submission.submitted_at,
            "status": submission.status,
            "marks_obtained": submission.marks_obtained,
            "feedback": submission.feedback,
        })

    return {
        "assignment_id": assignment_id,
        "assignment_title": assignment.title,
        "submissions": submissions_list
    }

@router.get(
    "/{submission_id}",
    status_code=status.HTTP_200_OK
)
async def get_submission_detail(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1 Fetch submission with student info
    stmt = select(Submission, User).join(
        User, Submission.student_id == User.id
    ).where(Submission.id == submission_id)
    result = await db.execute(stmt)
    submission_with_user = result.first()

    if not submission_with_user:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )
    
    submission, student = submission_with_user

    # 2 STUDENT ACCESS RULE
    if current_user['role'] == "student":
        if submission.student_id != int(current_user["sub"]):
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view this submission"
            )

    # 3 TEACHER ACCESS RULE
    elif current_user['role'] == "teacher":
        assignment_stmt = select(Assignment).where(
            Assignment.id == submission.assignment_id,
            Assignment.teacher_id == int(current_user["sub"])
        )
        assignment_result = await db.execute(assignment_stmt)
        assignment = assignment_result.scalar_one_or_none()

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view this submission"
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Invalid role"
        )

    # 4 Response shaping (important)
    response = {
        "id": submission.id,
        "submission_id": submission.id,
        "assignment_id": submission.assignment_id,
        "student_id": submission.student_id,
        "student": {
            "id": student.id,
            "email": student.email,
            "name": student.email.split("@")[0]
        },
        "aim_ans": submission.aim_ans,
        "objectives_ans": submission.objectives_ans,
        "code_ans": submission.code_ans,
        "conclusion_ans": submission.conclusion_ans,
        "status": submission.status,
        "submitted_at": submission.submitted_at,
    }

    # Show marks ONLY if evaluated
    if submission.status == "EVALUATED":
        response["marks_obtained"] = submission.marks_obtained
        response["feedback"] = submission.feedback
    else:
        response["marks_obtained"] = None
        response["feedback"] = None

    return response
