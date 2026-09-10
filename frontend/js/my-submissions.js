const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "student") {
  alert("Only students can view their submissions");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Load all submissions for the student
async function loadMySubmissions() {
  document.getElementById("loadingSubmissions").style.display = "block";
  document.getElementById("errorMessage").style.display = "none";
  document.getElementById("noSubmissions").style.display = "none";
  document.getElementById("submissionsGrid").style.display = "none";

  try {
    // Get all assignments first
    const assignmentsResponse = await fetch(`${API_BASE}/assignments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const assignments = await assignmentsResponse.json();

    // Create a map of assignment_id -> assignment details
    const assignmentMap = {};
    assignments.forEach(a => {
      assignmentMap[a.id] = a;
    });

    // Get student's submissions
    const submissionsResponse = await fetch(`${API_BASE}/submissions/my-submissions`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!submissionsResponse.ok) {
      throw new Error("Failed to load submissions");
    }

    const submissions = await submissionsResponse.json();

    document.getElementById("loadingSubmissions").style.display = "none";

    if (submissions.length === 0) {
      document.getElementById("noSubmissions").style.display = "flex";
      return;
    }

    // Display submissions
    displaySubmissions(submissions, assignmentMap);

  } catch (error) {
    document.getElementById("loadingSubmissions").style.display = "none";
    showError(error.message);
  }
}

function displaySubmissions(submissions, assignmentMap) {
  const grid = document.getElementById("submissionsGrid");
  grid.innerHTML = "";
  grid.style.display = "grid";

  // Sort by submission date (newest first)
  submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  submissions.forEach(sub => {
    const assignment = assignmentMap[sub.assignment_id] || {};
    const card = createSubmissionCard(sub, assignment);
    grid.appendChild(card);
  });
}

function createSubmissionCard(submission, assignment) {
  const card = document.createElement("div");
  card.className = "submission-card";

  const statusClass = submission.status === "EVALUATED" ? "status-evaluated" : 
                      submission.status === "PENDING" ? "status-pending" : "status-rejected";

  const statusIcon = submission.status === "EVALUATED" ? "✅" : 
                     submission.status === "PENDING" ? "⏳" : "❌";

  const marksDisplay = submission.marks_obtained !== null 
    ? `<div class="marks-obtained">${submission.marks_obtained} / ${assignment.max_marks || 10}</div>`
    : `<div class="marks-pending">Not Graded Yet</div>`;

  card.innerHTML = `
    <div class="card-header">
      <div class="assignment-title">${assignment.title || `Assignment ${submission.assignment_id}`}</div>
      <span class="status-badge ${statusClass}">${statusIcon} ${submission.status}</span>
    </div>
    
    <div class="card-body">
      <div class="info-row">
        <span class="label">📅 Submitted:</span>
        <span class="value">${new Date(submission.submitted_at).toLocaleString()}</span>
      </div>
      
      <div class="info-row">
        <span class="label">📝 Assignment ID:</span>
        <span class="value">#${submission.assignment_id}</span>
      </div>
      
      <div class="info-row">
        <span class="label">🆔 Submission ID:</span>
        <span class="value">#${submission.id}</span>
      </div>

      ${submission.status === "EVALUATED" ? `
        <div class="grade-section">
          <div class="grade-header">📊 Grade</div>
          ${marksDisplay}
          ${submission.feedback ? `
            <div class="feedback-section">
              <div class="feedback-label">💬 Feedback:</div>
              <div class="feedback-text">${submission.feedback}</div>
            </div>
          ` : ''}
        </div>
      ` : `
        <div class="pending-section">
          <div class="pending-icon">⏳</div>
          <div class="pending-text">Waiting for evaluation...</div>
        </div>
      `}
    </div>

    <div class="card-footer">
      <button class="btn-view" onclick="viewDetails(${submission.id})">
        👁️ View Details
      </button>
    </div>
  `;

  return card;
}

function showError(message) {
  const el = document.getElementById("errorMessage");
  el.textContent = message;
  el.style.display = "block";
}

window.viewDetails = function(submissionId) {
  window.location.href = `submission-detail.html?id=${submissionId}`;
};

// Load submissions on page load
loadMySubmissions();
