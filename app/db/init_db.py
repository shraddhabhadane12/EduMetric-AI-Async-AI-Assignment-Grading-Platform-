import asyncio

from app.db.session import engine
from app.db.base import Base

# IMPORTANT: import models so Base knows them
from app.models.user import User
from app.models.assignment import Assignment
from app.models.submission import Submission    


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(init_db())
