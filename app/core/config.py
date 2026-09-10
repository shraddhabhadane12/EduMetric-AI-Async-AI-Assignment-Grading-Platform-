import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # App Configuration
    PROJECT_NAME = os.getenv("APP_NAME", "EduMetric")
    DEBUG = os.getenv("DEBUG", "False") == "True"

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # Database Configuration
    # Async PostgreSQL connection string
    # Format: postgresql+asyncpg://user:password@host:port/database
    # Examples:
    #   - Local: postgresql+asyncpg://postgres:password@localhost:5432/edumetric
    #   - CI/CD: postgresql+asyncpg://postgres:postgres@localhost:5432/test_db
    DATABASE_URL = os.getenv("DATABASE_URL")


settings = Settings()

# Validate required settings
if not settings.JWT_SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set.")

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Example usage
# print(settings.PROJECT_NAME)      # EduMetric