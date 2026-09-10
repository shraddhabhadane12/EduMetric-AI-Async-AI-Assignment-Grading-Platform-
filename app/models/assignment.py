from sqlalchemy import (
    Column,
    Float,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from app.db.base import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)

    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)

    # Reference sections (from teacher PDF/text)
    aim_ref = Column(Text, nullable=True)
    objectives_ref = Column(Text, nullable=True)
    code_ref = Column(Text, nullable=True)
    conclusion_ref = Column(Text, nullable=True)

    max_marks = Column(Float, default=10)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
