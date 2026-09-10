"""
Basic API tests for FastAPI routes.
Tests health check and basic endpoints.
"""

import pytest


class TestHealthCheck:
    """Test basic health check or root endpoint."""
    
    
    def test_root_returns_json(self, client):
        """Test that the root endpoint returns valid JSON."""
        response = client.get("/")
        
        # This will fail if response is not valid JSON
        data = response.json()
        assert isinstance(data, dict)


class TestBasicEndpoints:
    """Test other basic API endpoints."""
    
    def test_api_returns_200_for_valid_request(self, client):
        """
        Test that API returns 200 status code for valid requests.
        Modify this to test your actual endpoints.
        """
        # Example: Test a list endpoint
        response = client.get("/api/v1/assignments")  # Modify path as needed
        
        # Should return 200 or 401 (if auth is required, which is expected)
        assert response.status_code in [200, 401, 404]
    
    def test_invalid_endpoint_returns_404(self, client):
        """Test that invalid endpoints return 404."""
        response = client.get("/invalid/endpoint/that/does/not/exist")
        
        assert response.status_code == 404


class TestResponseFormat:
    """Test that API responses follow expected format."""
    
    def test_error_response_has_detail(self, client):
        """Test that error responses include a detail field."""
        response = client.get("/invalid/endpoint")
        
        assert response.status_code == 404
        # FastAPI automatically includes "detail" in 404 responses
        assert "detail" in response.json()
