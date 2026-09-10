from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user


def require_teacher(current_user=Depends(get_current_user)):
    if current_user.get("role") != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required",
        )
    return current_user


def require_student(current_user=Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required",
        )
    return current_user
