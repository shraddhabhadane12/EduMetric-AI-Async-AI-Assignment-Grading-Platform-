const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "student") {
  alert("Only students can submit assignments");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

let selectedAssignmentId = null;
let extractedData = null;
let uploadedFile = null;

// Load assignments
async function loadAssignments() {
  document.getElementById("loadingAssignments").style.display = "block";

  try {
    // Endpoint: GET /assignments
    const response = await fetch(`${API_BASE}/assignments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const assignments = await response.json();
    document.getElementById("loadingAssignments").style.display = "none";

    const select = document.getElementById("assignmentId");
    select.innerHTML = '<option value="">-- Select an assignment --</option>';

    assignments.forEach(a => {
      const option = document.createElement("option");
      option.value = a.id;
      option.textContent = `${a.title || "Assignment"} (ID: ${a.id})`;
      select.appendChild(option);
    });

  } catch (error) {
    document.getElementById("loadingAssignments").style.display = "none";
    console.error(error);
  }
}

// Handle assignment selection
document.getElementById("assignmentId").addEventListener("change", () => {
  const value = document.getElementById("assignmentId").value;
  if (value) {
    selectedAssignmentId = value;
    document.getElementById("uploadSection").style.display = "block";
    document.getElementById("previewSection").style.display = "none";
  } else {
    selectedAssignmentId = null;
    document.getElementById("uploadSection").style.display = "none";
    document.getElementById("previewSection").style.display = "none";
  }
});

// Upload form - Step 1: Extract & Preview
const uploadForm = document.getElementById("uploadForm");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedAssignmentId) {
    showUploadError("Please select an assignment");
    return;
  }

  const fileInput = document.getElementById("pdfFile");
  const file = fileInput.files[0];

  if (!file) {
    showUploadError("Please select a PDF file");
    return;
  }

  if (!file.name.endsWith(".pdf")) {
    showUploadError("Only PDF files are allowed");
    return;
  }

  // Store file for later submission
  uploadedFile = file;

  // Show loading
  btnText.style.display = "none";
  btnLoader.style.display = "inline";

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Endpoint: POST /assignments/extract-pdf-preview
    const response = await fetch(`${API_BASE}/assignments/extract-pdf-preview`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to extract PDF content");
    }

    // Store extracted data
    extractedData = data;

    // Show preview
    document.getElementById("aimPreview").value = data.aim_ans || "N/A";
    document.getElementById("objectivesPreview").value = data.objectives_ans || "N/A";
    document.getElementById("codePreview").value = data.code_ans || "N/A";
    document.getElementById("conclusionPreview").value = data.conclusion_ans || "N/A";

    // Hide upload section, show preview section
    document.getElementById("uploadSection").style.display = "none";
    document.getElementById("previewSection").style.display = "block";

  } catch (error) {
    showUploadError(error.message);
  } finally {
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
});

// Submit form - Step 2: Confirm & Submit
const submitForm = document.getElementById("submitForm");
const submitBtnText = document.getElementById("submitBtnText");
const submitBtnLoader = document.getElementById("submitBtnLoader");

submitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!uploadedFile || !extractedData || !selectedAssignmentId) {
    showSubmitError("Something went wrong. Please try again.");
    return;
  }

  // Show loading
  submitBtnText.style.display = "none";
  submitBtnLoader.style.display = "inline";

  try {
    const formData = new FormData();
    formData.append("file", uploadedFile);

    // Endpoint: POST /assignments/{assignment_id}/submit-pdf
    const response = await fetch(`${API_BASE}/assignments/${selectedAssignmentId}/submit-pdf`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to submit assignment");
    }

    showSubmitSuccess(`✅ Assignment submitted successfully! Submission ID: ${data.submission_id}`);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);

  } catch (error) {
    showSubmitError(error.message);
  } finally {
    submitBtnText.style.display = "inline";
    submitBtnLoader.style.display = "none";
  }
});

// Reset button - go back to upload
document.getElementById("resetBtn").addEventListener("click", () => {
  extractedData = null;
  uploadedFile = null;
  document.getElementById("uploadForm").reset();
  document.getElementById("uploadSection").style.display = "block";
  document.getElementById("previewSection").style.display = "none";
  document.getElementById("uploadError").style.display = "none";
  document.getElementById("submitError").style.display = "none";
  document.getElementById("submitSuccess").style.display = "none";
});

function showUploadError(message) {
  const el = document.getElementById("uploadError");
  el.textContent = message;
  el.style.display = "block";
}

function showSubmitError(message) {
  const el = document.getElementById("submitError");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("submitSuccess").style.display = "none";
}

function showSubmitSuccess(message) {
  const el = document.getElementById("submitSuccess");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("submitError").style.display = "none";
}

// Load assignments on page load
loadAssignments();
