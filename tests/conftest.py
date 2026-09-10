"""
Pytest configuration and async fixtures for PostgreSQL testing.
"""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db


TEST_DATABASE_URL = (
    "postgresql+asyncpg://postgres:postgres@localhost:5432/test_db"
)

# ✅ Module-level engine — created once, lives for entire session
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    pool_pre_ping=False,   # ✅ disable pre-ping to avoid loop conflicts
)

TestingAsyncSessionLocal = sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def override_get_db():
    async with TestingAsyncSessionLocal() as session:
        yield session


async def mock_init_db():
    """
    ✅ Replace app's init_db so it doesn't create its own engine.
    Tables are already created by setup_db fixture.
    """
    pass


@pytest_asyncio.fixture(scope="function")
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await test_engine.dispose()


@pytest.fixture(scope="function")
def client(setup_db):

    app.dependency_overrides[get_db] = override_get_db

    # ✅ Patch init_db so lifespan doesn't spin up a second engine
    with patch("app.db.init_db.init_db", new=mock_init_db):
        with TestClient(app) as test_client:
            yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_token():
    return (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
        "eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OX0."
        "fake_token"
    )


@pytest.fixture(scope="function")
def authenticated_client(client, auth_token):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {auth_token}"
    }
    yield client