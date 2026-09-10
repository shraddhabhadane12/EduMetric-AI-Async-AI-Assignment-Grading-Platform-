from sqlalchemy import (
    Column,
    Text,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float
)
from sqlalchemy.sql import func

from app.db.base import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    assignment_id = Column(
        Integer, ForeignKey("assignments.id"), nullable=False
    )
    student_id = Column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    # Student answer sections
    aim_ans = Column(Text, nullable=True)
    objectives_ans = Column(Text, nullable=True)
    code_ans = Column(Text, nullable=True)
    conclusion_ans = Column(Text, nullable=True)

    # Evaluation result
    marks_obtained = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    status = Column(String(20), default="PENDING")
    # PENDING | EVALUATED

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluated_at = Column(DateTime(timezone=True), nullable=True)
