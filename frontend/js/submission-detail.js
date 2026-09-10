const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) window.location.href = "login.html";

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Get submission ID from URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
const submissionId = urlParams.get("id") || localStorage.getItem("lastGradedSubmissionId");

if (!submissionId) {
  showError("No submission ID provided");
  document.getElementById("loadingMsg").style.display = "none";
} else {
  loadSubmission(submissionId);
}

async function loadSubmission(id) {
  document.getElementById("loadingMsg").style.display = "block";

  try {
    // Endpoint: GET /submissions/{submission_id}
    const response = await fetch(`${API_BASE}/submissions/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to load submission");
    }

    // Display submission
    document.getElementById("submissionId").textContent = data.id || data.submission_id;
    document.getElementById("assignmentId").textContent = data.assignment_id;
    
    // Display student info if available
    if (data.student) {
      document.getElementById("studentId").textContent = `${data.student.name} (ID: ${data.student_id})`;
    } else {
      document.getElementById("studentId").textContent = data.student_id;
    }
    
    document.getElementById("status").textContent = data.status;
    document.getElementById("status").className = `badge ${data.status}`;
    document.getElementById("submittedAt").textContent = new Date(data.submitted_at).toLocaleString();

    document.getElementById("aimAns").textContent = data.aim_ans || "Not provided";
    document.getElementById("objectivesAns").textContent = data.objectives_ans || "Not provided";
    document.getElementById("codeAns").textContent = data.code_ans || "Not provided";
    document.getElementById("conclusionAns").textContent = data.conclusion_ans || "Not provided";

    // Show evaluation if available
    if (data.status === "EVALUATED") {
      document.getElementById("marksObtained").textContent = data.marks_obtained || "N/A";
      document.getElementById("feedback").textContent = data.feedback || "No feedback";
      document.getElementById("evaluationCard").style.display = "block";
    }

    document.getElementById("loadingMsg").style.display = "none";
    document.getElementById("contentSection").style.display = "block";

  } catch (error) {
    document.getElementById("loadingMsg").style.display = "none";
    showError(error.message);
  }
}

function showError(message) {
  const el = document.getElementById("errorMsg");
  el.textContent = message;
  el.style.display = "block";
}
