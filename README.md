# 🎓 EduMetric – AI-Powered Assignment Grading System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-3776ab?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Ollama-AI-000000?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6Ii8+PC9zdmc+" />
  <img src="https://img.shields.io/badge/License-MIT-green?logo=opensourceinitiative&logoColor=white" />
</p>

---

## 📌 Overview

**EduMetric** is a production-ready full-stack application that automates assignment grading using **local AI (Ollama)**. Teachers create assignments and set reference answers, students submit solutions (text or PDF), and the system evaluates submissions instantly using an AI model with detailed feedback.

This project demonstrates **enterprise-grade backend engineering** with:
- Role-based access control (RBAC)
- Asynchronous database operations
- PDF text extraction and parsing
- Local LLM integration
- Comprehensive testing and CI/CD automation
- Docker containerization for seamless deployment

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure token-based authentication with role management |
| 👥 **Role-Based Access Control** | Separate workflows for teachers and students |
| 🤖 **AI-Powered Grading** | Ollama local LLM evaluates structured assignments with feedback |
| 📄 **PDF Support** | Upload assignments and submit answers via PDF with text extraction |
| ✍️ **Text Submissions** | Direct text input for quick submissions |
| 📊 **Submission Tracking** | Students view submission history, grades, and AI feedback |
| 👨‍🏫 **Teacher Dashboard** | Create, manage assignments, and trigger AI grading |
| 🎨 **Modern UI** | Glassmorphic design with smooth animations and responsive layout |
| 🗄️ **PostgreSQL Database** | Normalized relational schema with async SQLAlchemy ORM |
| 🐳 **Docker Ready** | Containerized deployment with health checks |
| 🚀 **GitHub Actions CI/CD** | Automated testing, linting, and Docker image building |
| 🧪 **Pytest Test Suite** | Comprehensive API and authentication tests |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Browser)                     │
│          HTML5 • CSS3 • Vanilla JavaScript                   │
└────────────────────┬────────────────────────────────────────┘
                     │ Fetch API (JSON)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Authentication (JWT) • RBAC • Exception Handlers    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Routers (Auth, Assignment, Submission, Grading) │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Services (PDF Extraction, Text Parsing, Grading)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────┬──────────────────────────┬──────────────────────────┘
      │                          │
      ↓                          ↓
┌──────────────────┐    ┌─────────────────────┐
│  PostgreSQL DB   │    │ Ollama API          │
│  (Assignments,   │    │ (Phi Model)         │
│   Users,         │    │ (localhost:11434)   │
│   Submissions)   │    │                     │
└──────────────────┘    └─────────────────────┘
```

---

## 🛠️ Tech Stack

### **Backend**
- **FastAPI 0.104+** – Async web framework with automatic OpenAPI docs
- **SQLAlchemy 2.0+ (Async)** – Async ORM for database operations
- **PostgreSQL 16** – Relational database
- **Pydantic** – Data validation and serialization
- **Python-Jose + Cryptography** – JWT token generation and validation
- **Passlib + Bcrypt** – Secure password hashing
- **Pdfplumber** – PDF text extraction (text-based PDFs)

### **Frontend**
- **HTML5/CSS3** – Semantic markup with modern styling
- **Vanilla JavaScript (ES6+)** – No framework dependencies
- **Fetch API** – Browser HTTP client
- **LocalStorage** – Client-side JWT token persistence

### **AI & ML**
- **Ollama** – Local LLM inference platform (free, runs locally)
- **Phi Model** – Lightweight language model for grading
- **Requests** – HTTP library for Ollama API communication

### **DevOps & Testing**
- **Docker** – Container runtime with health checks
- **GitHub Actions** – CI/CD pipeline for automated testing
- **Pytest** – Unit and integration testing framework
- **Pytest-Asyncio** – Async test support
- **Flake8** – Code quality linting
- **Pytest-Cov** – Code coverage analysis

---

## 📂 Project Structure

```
edumetric/
├── app/
│   ├── api/
│   │   ├── routers_auth.py              # Register, Login, Get Current User
│   │   ├── routers_assignment.py        # CRUD operations for assignments
│   │   ├── routers_assignment_pdf.py    # PDF upload & extraction
│   │   ├── routers_submission.py        # Student submissions
│   │   └── routers_grading.py           # AI grading endpoint
│   │
│   ├── core/
│   │   ├── config.py                    # Settings from environment
│   │   ├── constants.py                 # Application constants
│   │   ├── security.py                  # JWT & password utilities
│   │   ├── dependencies.py              # FastAPI dependency injection
│   │   ├── rbac.py                      # Role-based access control
│   │   └── exceptions.py                # Custom exceptions & handlers
│   │
│   ├── db/
│   │   ├── base.py                      # SQLAlchemy declarative base
│   │   ├── session.py                   # Database session factory
│   │   └── init_db.py                   # Database initialization
│   │
│   ├── models/
│   │   ├── user.py                      # User model (Teacher/Student)
│   │   ├── assignment.py                # Assignment model with sections
│   │   └── submission.py                # Submission model with marks
│   │
│   ├── schemas/
│   │   ├── auth.py                      # Request/Response schemas
│   │   ├── assignment.py                # Assignment validation schemas
│   │   └── submission.py                # Submission validation schemas
│   │
│   ├── services/
│   │   ├── grading_service.py           # Ollama AI grading logic
│   │   ├── pdf_extractor.py             # PDF text extraction
│   │   └── text_parser.py               # Parse sections from text
│   │
│   └── main.py                          # FastAPI app initialization
│
├── frontend/
│   ├── home.html                        # Landing page
│   ├── login.html                       # User login
│   ├── register.html                    # User registration
│   ├── dashboard.html                   # Teacher/Student dashboard
│   ├── assignments.html                 # Browse assignments
│   ├── assignment-detail.html           # View assignment details
│   ├── create-assignment.html           # Create assignment (Teacher)
│   ├── upload-pdf.html                  # Upload assignment PDF
│   ├── submit.html                      # Submit text answer
│   ├── submit-pdf.html                  # Submit PDF answer
│   ├── my-submissions.html              # View submissions
│   ├── submission-detail.html           # View grades & feedback
│   ├── view-submissions.html            # View all submissions (Teacher)
│   ├── grading.html                     # AI grading interface
│   │
│   ├── css/
│   │   └── *.css                        # Page-specific stylesheets
│   └── js/
│       └── *.js                         # Page-specific scripts
│
├── tests/
│   ├── conftest.py                      # Pytest fixtures & test config
│   ├── test_api.py                      # API endpoint tests
│   ├── test_auth.py                     # Authentication tests
│   └── test_examples.py                 # Real-world example tests
│
├── .github/
│   └── workflows/
│       └── main.yml                     # GitHub Actions CI/CD pipeline
│
├── Dockerfile                           # Docker image definition
├── .dockerignore                        # Files to exclude from Docker
├── pytest.ini                           # Pytest configuration
├── requirements.txt                     # Python dependencies
└── README.md                            # This file
```

---

## 🚀 Getting Started

### **Prerequisites**

- **Python 3.13+** – [Download](https://www.python.org/downloads/)
- **PostgreSQL 16+** – [Download](https://www.postgresql.org/download/)
- **Ollama** – [Download](https://ollama.ai/) with Phi model

### **1. Install Ollama & Pull Model**

```bash
# Install Ollama from https://ollama.ai
# Then pull the Phi model
ollama pull phi

# Start Ollama server (runs on localhost:11434 by default)
ollama serve
```

### **2. Clone Repository**

```bash
git clone https://github.com/Shounak-Chavan/EduMetric.git
cd EduMetric/Project
```

### **3. Create Virtual Environment**

```bash
# Windows
python -m venv myvenv
myvenv\Scripts\activate

# Linux/Mac
python3 -m venv myvenv
source myvenv/bin/activate
```

### **4. Install Dependencies**

```bash
pip install -r requirements.txt
```

### **5. Configure Environment Variables**

Create a `.env` file in the project root:

```env
# Application
APP_NAME=EduMetric
DEBUG=True

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/edumetric

# Ollama (must be running)
# OLLAMA_URL defaults to http://localhost:11434
```

**⚠️ Important:** Change `SECRET_KEY` to a random string in production!

### **6. Initialize Database**

```bash
# Create database in PostgreSQL
psql -U postgres
CREATE DATABASE edumetric;
\q

# Initialize tables
python -c "from app.db.init_db import init_db; import asyncio; asyncio.run(init_db())"
```

### **7. Run Development Server**

```bash
uvicorn app.main:app --reload --port 8000
```

The server starts at **http://localhost:8000**

---

## 📖 Usage

### **For Teachers**

1. **Register** at http://localhost:8000/register.html (select "Teacher")
2. **Login** at http://localhost:8000/login.html
3. **Create Assignment** – Enter title and reference answers for sections (Aim, Objectives, Code, Conclusion)
4. **View Submissions** – See all student submissions in table format
5. **Grade with AI** – Click "Grade" button to evaluate using Ollama
6. **Review Results** – Check scores and AI-generated feedback

### **For Students**

1. **Register** at http://localhost:8000/register.html (select "Student")
2. **Login** at http://localhost:8000/login.html
3. **Browse Assignments** – View all active assignments
4. **Submit Answer** – Type answers directly or upload PDF
5. **Check Status** – View submission status (Pending/Evaluated)
6. **View Grades** – See marks and AI feedback once evaluated

### **AI Grading Process**

```
Student Submits
       ↓
Backend fetches Assignment & Submission
       ↓
For each section (Aim, Objectives, Code, Conclusion):
  - Send to Ollama API:
    * Section name
    * Teacher reference answer
    * Student answer
    * Max marks
       ↓
  - Ollama returns: (score, feedback)
       ↓
Sum all section scores
       ↓
Save to database
       ↓
Student sees grade & feedback
```

---

## 🔌 API Reference

### **Base URL**
```
http://localhost:8000/api/v1
```

All endpoints (except `/auth/register`, `/auth/login`) require:
```
Authorization: Bearer <access_token>
```

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register/{role}` | Register user (teacher/student) | ❌ |
| POST | `/auth/login` | Login and get JWT token | ❌ |
| GET | `/auth/me` | Get current user info | ✅ |

**Register Request:**
```json
{
  "email": "teacher@example.com",
  "password": "securepassword"
}
```

**Login Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### **Assignment Endpoints**

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| GET | `/assignments` | List all assignments | Student or Teacher |
| POST | `/assignments` | Create assignment | Teacher |
| GET | `/assignments/{id}` | Get assignment details | Student or Teacher |
| POST | `/assignments/upload-pdf` | Upload assignment PDF | Teacher |
| POST | `/assignments/extract-pdf-preview` | Preview PDF extraction | Teacher |

**Create Assignment Request:**
```json
{
  "title": "Python Functions",
  "aim_ref": "Write a function...",
  "objectives_ref": "Learn about...",
  "code_ref": "def example(): pass",
  "conclusion_ref": "Summary...",
  "max_marks": 10
}
```

### **Submission Endpoints**

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| POST | `/assignments/{id}/submit` | Submit text answer | Student |
| POST | `/assignments/{id}/submit-pdf` | Submit PDF answer | Student |
| GET | `/submissions/my-submissions` | Get student's submissions | Student |
| GET | `/submissions/{id}` | Get submission details | Student/Teacher |
| GET | `/submissions/assignment/{id}` | Get all submissions for assignment | Teacher |

**Submit Request:**
```json
{
  "aim_ans": "Student's aim...",
  "objectives_ans": "Student's objectives...",
  "code_ans": "student_code_here",
  "conclusion_ans": "Student's conclusion..."
}
```

### **Grading Endpoint**

| Method | Endpoint | Description | Requires |
|--------|----------|-------------|----------|
| POST | `/grading/assignments/{aid}/submissions/{sid}` | Grade submission with AI | Teacher |

**Response:**
```json
{
  "submission_id": 123,
  "marks_obtained": 7.5,
  "feedback": "Good implementation with minor issues.",
  "status": "EVALUATED"
}
```

---

## 🧪 Testing

### **Run All Tests**

```bash
pytest -v
```

### **Run Specific Test File**

```bash
pytest tests/test_auth.py -v
pytest tests/test_api.py -v
```

### **Run with Coverage Report**

```bash
pytest --cov=app --cov-report=html
# Open: htmlcov/index.html
```

### **Run Specific Test by Name**

```bash
pytest -k "test_login" -v
```

### **Test Structure**

```
tests/
├── conftest.py                  # Shared fixtures
│   ├── client (FastAPI TestClient)
│   ├── authenticated_client (with JWT)
│   ├── db (test database session)
│   └── auth_token (mock JWT)
│
├── test_api.py                  # API endpoint tests
│   └── GET /, POST /assignments, etc.
│
├── test_auth.py                 # Authentication tests
│   └── Register, Login, Protected routes
│
└── test_examples.py             # Real-world example tests
    └── End-to-end workflows
```

### **Example Test**

```python
def test_login_success(client):
    """Test successful user login"""
    response = client.post("/auth/login", json={
        "email": "teacher@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## 🐳 Docker Deployment

### **Build Docker Image**

```bash
docker build -t edumetric:latest .
```

### **Run Docker Container**

```bash
docker run -p 8000:8000 \
  -e APP_NAME=EduMetric \
  -e SECRET_KEY=your-secret-key \
  -e DATABASE_URL=postgresql+asyncpg://user:password@host:5432/edumetric \
  edumetric:latest
```

### **Docker Compose (Optional)**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:password@db:5432/edumetric
      SECRET_KEY: your-secret-key
    depends_on:
      - db
    
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: edumetric
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with: `docker-compose up --build`

---

## 🚀 GitHub Actions CI/CD

The repository includes automated testing and deployment:

### **Workflow Triggers**
- ✅ Every push to `main` or `develop`
- ✅ Every pull request

### **Workflow Steps**
1. **Checkout code** from GitHub
2. **Setup Python 3.13** environment
3. **Install dependencies** from `requirements.txt`
4. **Run linting** with Flake8
5. **Run tests** with Pytest and coverage
6. **Build Docker image** and verify it runs

### **View Results**
1. Push code to GitHub
2. Go to **Actions** tab
3. Click the workflow run
4. Review logs, test results, coverage

---

## 📋 Environment Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `APP_NAME` | String | EduMetric | Application name |
| `DEBUG` | Boolean | False | Enable debug mode |
| `SECRET_KEY` | String | *(Required)* | JWT signing key (change in production!) |
| `ALGORITHM` | String | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | 60 | JWT token expiry |
| `DATABASE_URL` | String | *(Required)* | PostgreSQL async connection string |

**Example `.env` File:**
```env
APP_NAME=EduMetric
DEBUG=False
SECRET_KEY=abc123xyz789change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
DATABASE_URL=postgresql+asyncpg://postgres:mypassword@localhost:5432/edumetric
```

---

## 🔐 Security Considerations

- ✅ **Passwords hashed** with bcrypt (salted)
- ✅ **JWT tokens signed** with secret key
- ✅ **Role-based access control** on all protected endpoints
- ✅ **CORS enabled** for development (restrict in production)
- ✅ **Database prepared statements** (SQLAlchemy ORM)
- ⚠️ **Change `SECRET_KEY`** before production deployment
- ⚠️ **Use HTTPS** in production
- ⚠️ **Restrict CORS origins** to specific domains

---

## 🛠️ Troubleshooting

### **Ollama Connection Error**

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### **Database Connection Error**

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL in .env
# Create database if missing:
createdb edumetric
```

### **PDF Extraction Fails**

- Ensure PDF is **text-based** (not scanned image)
- Check file size (large PDFs may timeout)
- Verify pdfplumber: `python -c "import pdfplumber; print('OK')"`

### **Tests Fail**

```bash
# Ensure virtual environment is active
source myvenv/bin/activate  # Linux/Mac
myvenv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Run tests with verbose output
pytest -v -s
```

### **Docker Build Fails**

```bash
# Clear Docker cache
docker build --no-cache -t edumetric:latest .

# Check dependency issues
pip install --dry-run -r requirements.txt
```

---

## 📚 Quick Reference

### **Common Commands**

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Testing
pytest -v
pytest --cov=app --cov-report=html
pytest tests/test_auth.py::test_login -v

# Code Quality
flake8 app --max-line-length=100

# Docker
docker build -t edumetric:latest .
docker run -p 8000:8000 edumetric:latest

# Database
python -c "from app.db.init_db import init_db; import asyncio; asyncio.run(init_db())"

# Virtual Environment
python -m venv myvenv
myvenv\Scripts\activate  # Windows
source myvenv/bin/activate  # Linux/Mac
```

### **Key URLs**

| URL | Purpose |
|-----|---------|
| `http://localhost:8000/` | API root (redirects to /docs) |
| `http://localhost:8000/docs` | Swagger UI (interactive API docs) |
| `http://localhost:8000/redoc` | ReDoc (alternative API docs) |
| `http://localhost:8000/home.html` | Landing page |
| `http://localhost:8000/login.html` | User login |
| `http://localhost:8000/register.html` | User registration |
| `http://localhost:8000/dashboard.html` | User dashboard |

---

## 🔮 Future Roadmap

- [ ] **Analytics Dashboard** – Marks distribution, submission trends
- [ ] **Real-time Notifications** – WebSocket support for grade updates
- [ ] **Pagination** – Handle large submission lists efficiently
- [ ] **Multiple AI Models** – Support GPT, Claude, Gemini
- [ ] **Email Notifications** – Notify students of grades
- [ ] **Dark Mode** – User interface theme toggle
- [ ] **Search & Filter** – Advanced assignment search
- [ ] **Rate Limiting** – Prevent API abuse
- [ ] **Cloud Deployment** – AWS, Railway, Render templates
- [ ] **Mobile App** – React Native/Flutter client

---

## 📄 License

This project is licensed under the **MIT License** – See LICENSE file for details.

---

## 👨‍💻 About

**EduMetric** is an educational project demonstrating:
- Full-stack web development with FastAPI
- Asynchronous Python programming
- Local AI integration (Ollama)
- Database design and async ORM patterns
- Testing and CI/CD automation
- Docker containerization

**Not intended for production use without proper security hardening, testing, and scaling considerations.**

---

## ⭐ Support

If you found this project useful, please consider:
- ⭐ **Star the repository** on GitHub
- 🐛 **Report issues** if you find bugs
- 🤝 **Contribute** improvements via pull requests
- 📧 **Share feedback** to help improve the project

---

**Made with ❤️ by [Shounak](https://github.com/Shounak-Chavan)**
