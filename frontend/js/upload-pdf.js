const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "teacher") {
  alert("Only teachers can upload PDFs");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

const uploadForm = document.getElementById("uploadForm");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("pdfFile");
  const file = fileInput.files[0];

  if (!file) {
    showError("Please select a PDF file");
    return;
  }

  if (!file.name.endsWith(".pdf")) {
    showError("Only PDF files are allowed");
    return;
  }

  // Show loading
  btnText.style.display = "none";
  btnLoader.style.display = "inline";

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Endpoint: POST /assignments/upload-pdf
    const response = await fetch(`${API_BASE}/assignments/upload-pdf`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to upload PDF");
    }

    const assignmentId = data.assignment_id;
    
    showSuccess(`PDF uploaded successfully! Assignment ID: ${assignmentId}`);
    
    // Show View Submissions button
    const successDiv = document.getElementById("uploadSuccess");
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "📋 View Submissions";
    viewBtn.className = "btn btn-primary";
    viewBtn.style.marginTop = "10px";
    viewBtn.onclick = () => {
      window.location.href = `view-submissions.html?assignment_id=${assignmentId}`;
    };
    successDiv.appendChild(document.createElement("br"));
    successDiv.appendChild(viewBtn);
    
    uploadForm.reset();

  } catch (error) {
    showError(error.message);
  } finally {
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
});

function showError(message) {
  const el = document.getElementById("uploadError");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("uploadSuccess").style.display = "none";
}

function showSuccess(message) {
  const el = document.getElementById("uploadSuccess");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("uploadError").style.display = "none";
}
