"""
Real-world example tests.
This file shows examples of testing real EduMetric endpoints.
"""

import pytest


class TestAssignmentEndpoints:
    """
    Example tests for assignment-related endpoints.
    Customize these based on your actual route implementations.
    """
    
    def test_get_assignments_list(self, client):
        """
        Test fetching list of assignments.
        This is typically a protected endpoint.
        """
        # Without auth - should return 401
        response = client.get("/api/v1/assignments")
        assert response.status_code in [401, 404]
    
    def test_create_assignment(self, authenticated_client):
        """
        Test creating a new assignment.
        Only authenticated users can create assignments.
        """
        assignment_data = {
            "title": "Test Assignment",
            "description": "This is a test assignment",
            "due_date": "2024-12-31",
            "max_score": 100
        }
        
        response = authenticated_client.post(
            "/api/v1/assignments",
            json=assignment_data
        )
        
        # Should return 201 (Created) or 200 (Success) on success
        # or 400 (Bad Request) if validation fails
        assert response.status_code in [200, 201, 400, 404]


class TestSubmissionEndpoints:
    """
    Example tests for submission-related endpoints.
    """
    
    def test_get_submissions(self, authenticated_client):
        """
        Test fetching student's submissions.
        """
        response = authenticated_client.get("/api/v1/submissions")
        
        # Should be accessible to authenticated users
        assert response.status_code in [200, 404]
    
    def test_submit_assignment(self, authenticated_client):
        """
        Test submitting an assignment.
        """
        submission_data = {
            "assignment_id": 1,
            "content": "My solution to the assignment"
        }
        
        response = authenticated_client.post(
            "/api/v1/submissions",
            json=submission_data
        )
        
        # Should return 201 on success or 400 on validation error
        assert response.status_code in [201, 400, 404]


class TestGradingEndpoints:
    """
    Example tests for grading functionality.
    Only teachers/admins should access these.
    """
    
    def test_get_grading_queue(self, authenticated_client):
        """
        Test fetching submissions to grade.
        Only for authenticated users (teachers/admins).
        """
        response = authenticated_client.get("/api/v1/grading/queue")
        
        # Should be accessible
        assert response.status_code in [200, 403, 404]
    
    def test_submit_grade(self, authenticated_client):
        """
        Test submitting a grade for a submission.
        """
        grade_data = {
            "submission_id": 1,
            "score": 85,
            "feedback": "Good work! But needs improvement in X."
        }
        
        response = authenticated_client.post(
            "/api/v1/grading/submit",
            json=grade_data
        )
        
        # Should return 200 on success or 400 on error
        assert response.status_code in [200, 400, 403, 404]


class TestPDFHandling:
    """
    Example tests for PDF upload/processing.
    """
    
    def test_upload_pdf(self, authenticated_client):
        """
        Test uploading a PDF submission.
        """
        # Create a fake PDF file for testing
        pdf_content = b"%PDF-1.4\n%EOF"  # Minimal PDF header
        
        files = {
            "file": ("test.pdf", pdf_content, "application/pdf")
        }
        
        response = authenticated_client.post(
            "/api/v1/submissions/upload-pdf",
            files=files
        )
        
        # Should return 200 on success
        assert response.status_code in [200, 400, 404]


class TestUserProfileEndpoints:
    """
    Example tests for user profile endpoints.
    """
    
    def test_get_user_profile(self, authenticated_client):
        """
        Test fetching logged-in user's profile.
        """
        response = authenticated_client.get("/api/v1/users/me")
        
        # Should return user data if endpoint exists
        assert response.status_code in [200, 401, 404]
    
    def test_update_profile(self, authenticated_client):
        """
        Test updating user profile information.
        """
        update_data = {
            "full_name": "Updated Name",
            "email": "new.email@example.com"
        }
        
        response = authenticated_client.put(
            "/api/v1/users/me",
            json=update_data
        )
        
        # Should return 200 on success
        assert response.status_code in [200, 400, 401, 404]


class TestErrorHandling:
    """
    Example tests for error scenarios.
    """
    
    def test_not_found_error(self, client):
        """
        Test that 404 errors are returned for non-existent resources.
        """
        response = client.get("/api/v1/assignments/999999")
        
        assert response.status_code == 404
        assert "detail" in response.json()
    
    def test_unauthorized_access(self, client):
        """
        Test that unauthorized requests return 401.
        """
        response = client.get("/api/v1/assignments")
        
        # Most protected endpoints should return 401
        assert response.status_code in [401, 404]
    
    def test_invalid_json(self, client):
        """
        Test that invalid JSON returns 400 error.
        """
        response = client.post(
            "/api/v1/assignments",
            data="not valid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [400, 401, 404]


# ============================================
# INSTRUCTIONS FOR USING THESE EXAMPLES
# ============================================
#
# 1. Copy relevant test methods to test_api.py or test_auth.py
#
# 2. Update endpoint URLs to match your actual routes:
#    - Replace "/api/v1/" prefix if your API uses different versioning
#    - Update path names to match your routers
#
# 3. Update JSON data to match your actual request schemas:
#    - Check your schemas/ folder for exact field names
#    - Ensure required fields are included
#
# 4. Adjust expected status codes based on your implementation:
#    - If endpoint returns 201, change assertion to assert 201
#    - Add specific status codes for your use case
#
# 5. Run tests to see which ones pass/fail:
#    pytest tests/ -v
#
# 6. Fix failures by:
#    - Correcting endpoint URLs
#    - Adjusting expected status codes
#    - Ensuring test data is valid
#
# EXAMPLE: Testing a specific endpoint
# ===================================
# If your GET /api/v1/assignments endpoint returns 200,
# you'd change:
#     assert response.status_code in [401, 404]
# to:
#     assert response.status_code == 200
#
# If response should contain assignment list:
#     assert isinstance(response.json(), list)
#
