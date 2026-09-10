from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(prefix="/auth", tags=["Auth"])


# ---------------- REGISTER ----------------

@router.post("/register/{role}", response_model=RegisterResponse)
async def register_user(
    role: str,
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    if role not in ["teacher", "student"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    result = await db.execute(select(User).where(User.email == data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=role,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return RegisterResponse(
        id=str(user.id),
        email=user.email,
        role=user.role,
    )


# ---------------- LOGIN ----------------

@router.post("/login", response_model=TokenResponse)
async def login_user(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
    )


# ---------------- PROTECTED TEST ----------------

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user
