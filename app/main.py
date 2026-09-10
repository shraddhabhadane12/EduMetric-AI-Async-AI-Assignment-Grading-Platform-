from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from fastapi.security import HTTPBearer

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.api.routers_auth import router as auth_router
from app.api.routers_assignment import router as assignment_router
from app.api.routers_assignment_pdf import router as assignment_pdf_router
from app.db.init_db import init_db
from app.api.routers_grading import router as grading_router
from app.api.routers_submission import router as submission_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await init_db()
    yield
    # shutdown (nothing for now)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

# -------- CORS MIDDLEWARE --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# THIS LINE ENABLES AUTHORIZE BUTTON
app.openapi_schema = None
security = HTTPBearer()

# -------- ROUTERS --------
app.include_router(auth_router, tags=["Auth"])
app.include_router(assignment_router, tags=["Assignments"])
app.include_router(assignment_pdf_router, tags=["Assignments (PDF)"])
app.include_router(grading_router, tags=["Grading"])
app.include_router(submission_router, tags=["Submissions"])

# -------- EXCEPTIONS --------
register_exception_handlers(app)
