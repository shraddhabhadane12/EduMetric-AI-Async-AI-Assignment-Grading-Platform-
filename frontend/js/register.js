const API_BASE = "http://localhost:8000";

const form = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation
  if (!email || !password) {
    showError("All fields are required");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters");
    return;
  }

  // Show loading
  btnText.style.display = "none";
  btnLoader.style.display = "inline";
  errorMsg.style.display = "none";

  try {
    // Endpoint: POST /auth/register/{role}
    const response = await fetch(`${API_BASE}/auth/register/${role}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    // Success
    showSuccess("Account created successfully! Redirecting to login...");
    form.reset();
    
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

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
  successMsg.style.display = "none";
}

function showSuccess(message) {
  successMsg.textContent = message;
  successMsg.style.display = "block";
  errorMsg.style.display = "none";
}
