// Check if already logged in
const token = localStorage.getItem("accessToken");
if (token) {
  window.location.href = "dashboard.html";
}

// Button handlers
document.getElementById("loginBtn").addEventListener("click", () => {
  window.location.href = "login.html";
});

document.getElementById("registerBtn").addEventListener("click", () => {
  window.location.href = "register.html";
});
