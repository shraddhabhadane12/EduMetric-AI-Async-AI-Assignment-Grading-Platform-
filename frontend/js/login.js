const API_BASE = "http://localhost:8000";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showError("All fields are required");
    return;
  }

  // Show loading
  btnText.style.display = "none";
  btnLoader.style.display = "inline";
  errorMsg.style.display = "none";

  try {
    // Endpoint: POST /auth/login
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    // Save token
    localStorage.setItem("accessToken", data.access_token);

    // Get user info using the token
    const userResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${data.access_token}`,
      },
    });

    const userData = await userResponse.json();
    localStorage.setItem("currentUser", JSON.stringify({
      sub: userData.sub,
      role: userData.role,
      email: email
    }));

    // Redirect to dashboard
    window.location.href = "dashboard.html";

  } catch (error) {
    showError(error.message);
  } finally {
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
});

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
}
