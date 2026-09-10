from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create async engine for PostgreSQL with asyncpg driver
# Database URL format: postgresql+asyncpg://user:password@host:port/database
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL debugging
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    autoflush=False,
    class_=AsyncSession,
    autocommit=False,
    bind=engine,
    expire_on_commit=False
)


async def get_db():
    """
    Get database session for dependency injection.
    Yields an async SQLAlchemy session for API endpoints.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()