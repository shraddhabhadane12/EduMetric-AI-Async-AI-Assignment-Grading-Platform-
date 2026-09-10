const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "student") {
  alert("Only students can view assignment details");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Get assignment ID from URL
const urlParams = new URLSearchParams(window.location.search);
const assignmentId = urlParams.get("id");

if (!assignmentId) {
  showError("Assignment ID not provided");
  setTimeout(() => window.location.href = "assignments.html", 2000);
}

// Load assignment details
async function loadAssignmentDetails() {
  document.getElementById("loadingMsg").style.display = "block";
  document.getElementById("assignmentDetail").style.display = "none";

  try {
    // Endpoint: GET /assignments
    const response = await fetch(`${API_BASE}/assignments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const assignments = await response.json();
    const assignment = assignments.find(a => a.id == assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    displayAssignment(assignment);

  } catch (error) {
    document.getElementById("loadingMsg").style.display = "none";
    showError(error.message);
  }
}

function displayAssignment(assignment) {
  document.getElementById("loadingMsg").style.display = "none";
  document.getElementById("assignmentDetail").style.display = "block";

  // Header
  document.getElementById("assignmentTitle").textContent = assignment.title || "Untitled Assignment";
  document.getElementById("assignmentId").textContent = `ID: ${assignment.id}`;
  document.getElementById("maxMarks").textContent = `Max Marks: ${assignment.max_marks || "N/A"}`;

  // Aim
  const aimSection = document.getElementById("aimSection");
  if (assignment.aim_ref && assignment.aim_ref.trim()) {
    document.getElementById("aimContent").textContent = assignment.aim_ref;
    aimSection.style.display = "block";
  } else {
    aimSection.style.display = "none";
  }

  // Objectives
  const objectivesSection = document.getElementById("objectivesSection");
  if (assignment.objectives_ref && assignment.objectives_ref.trim()) {
    document.getElementById("objectivesContent").textContent = assignment.objectives_ref;
    objectivesSection.style.display = "block";
  } else {
    objectivesSection.style.display = "none";
  }

  // Code
  const codeSection = document.getElementById("codeSection");
  if (assignment.code_ref && assignment.code_ref.trim()) {
    document.getElementById("codeContent").textContent = assignment.code_ref;
    codeSection.style.display = "block";
  } else {
    codeSection.style.display = "none";
  }

  // Conclusion
  const conclusionSection = document.getElementById("conclusionSection");
  if (assignment.conclusion_ref && assignment.conclusion_ref.trim()) {
    document.getElementById("conclusionContent").textContent = assignment.conclusion_ref;
    conclusionSection.style.display = "block";
  } else {
    conclusionSection.style.display = "none";
  }

  // Submit button
  document.getElementById("submitBtn").onclick = () => {
    localStorage.setItem("selectedAssignmentId", assignment.id);
    window.location.href = "submit.html";
  };
}

function showError(message) {
  const el = document.getElementById("errorMsg");
  el.textContent = message;
  el.style.display = "block";
}

// Load on page load
loadAssignmentDetails();
