const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "teacher") {
  alert("Only teachers can grade submissions");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Check for assignment_id and submission_id in URL (from view-submissions page)
const urlParams = new URLSearchParams(window.location.search);
const urlAssignmentId = urlParams.get("assignment_id");
const urlSubmissionId = urlParams.get("submission_id");

let assignments = [];
let allSubmissions = {};

// Load teacher's assignments
async function loadAssignments() {
  document.getElementById("loadingAssignments").style.display = "block";

  try {
    const response = await fetch(`${API_BASE}/assignments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    document.getElementById("loadingAssignments").style.display = "none";

    // Filter to show only teacher's own assignments
    assignments = data.filter(a => a.teacher_id === parseInt(user.sub));

    const select = document.getElementById("assignmentSelect");
    select.innerHTML = '<option value="">-- Choose an assignment --</option>';

    assignments.forEach(a => {
      const option = document.createElement("option");
      option.value = a.id;
      option.textContent = a.title || `Assignment ${a.id}`;
      select.appendChild(option);
    });

    // If URL has assignment_id, pre-select and load submissions
    if (urlAssignmentId) {
      select.value = urlAssignmentId;
      await loadSubmissionsForAssignment(urlAssignmentId);
      
      // If URL also has submission_id, pre-select it and show context
      if (urlSubmissionId) {
        await loadSubmissionContext(urlAssignmentId, urlSubmissionId);
      }
    }

  } catch (error) {
    document.getElementById("loadingAssignments").style.display = "none";
    showError("Failed to load assignments: " + error.message);
  }
}

// Load submissions for selected assignment
async function loadSubmissionsForAssignment(assignmentId) {
  const submissionSelect = document.getElementById("submissionSelect");
  submissionSelect.innerHTML = '<option value="">-- Choose a submission --</option>';
  submissionSelect.disabled = true;
  document.getElementById("loadingSubmissions").style.display = "block";
  document.getElementById("gradeBtn").disabled = true;

  try {
    const response = await fetch(`${API_BASE}/submissions/assignment/${assignmentId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    document.getElementById("loadingSubmissions").style.display = "none";

    if (!response.ok) {
      throw new Error(data.detail || "Failed to load submissions");
    }

    // Filter to show only PENDING submissions
    const pendingSubmissions = data.submissions.filter(s => s.status === "PENDING");
    
    if (pendingSubmissions.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No pending submissions";
      submissionSelect.appendChild(option);
      return;
    }

    allSubmissions[assignmentId] = data.submissions;

    pendingSubmissions.forEach(s => {
      const option = document.createElement("option");
      option.value = s.submission_id;
      option.textContent = `${s.student_name} (${s.student_email}) - Submitted: ${new Date(s.submitted_at).toLocaleDateString()}`;
      submissionSelect.appendChild(option);
    });

    submissionSelect.disabled = false;

    // Auto-select if URL has submission_id
    if (urlSubmissionId) {
      submissionSelect.value = urlSubmissionId;
      document.getElementById("submissionId").value = urlSubmissionId;
      document.getElementById("gradeBtn").disabled = false;
    }

  } catch (error) {
    document.getElementById("loadingSubmissions").style.display = "none";
    showError("Failed to load submissions: " + error.message);
  }
}

// Load submission context for display
async function loadSubmissionContext(assignmentId, submissionId) {
  try {
    const response = await fetch(`${API_BASE}/submissions/${submissionId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const sub = await response.json();
      const assignment = assignments.find(a => a.id == assignmentId);
      
      document.getElementById("contextAssignment").textContent = assignment?.title || `Assignment ${assignmentId}`;
      const studentName = sub.student?.name || sub.student?.email?.split('@')[0] || 'Unknown';
      const studentEmail = sub.student?.email || 'N/A';
      document.getElementById("contextStudent").textContent = `${studentName} (${studentEmail})`;
      document.getElementById("contextDate").textContent = new Date(sub.submitted_at).toLocaleString();
      document.getElementById("submissionContext").style.display = "block";
      
      // Set hidden IDs
      document.getElementById("assignmentId").value = assignmentId;
      document.getElementById("submissionId").value = submissionId;
      document.getElementById("gradeBtn").disabled = false;
    }
  } catch (error) {
    console.log("Could not load submission context");
  }
}

// Handle assignment selection
document.getElementById("assignmentSelect").addEventListener("change", async (e) => {
  const assignmentId = e.target.value;
  document.getElementById("assignmentId").value = assignmentId;
  document.getElementById("submissionId").value = "";
  document.getElementById("submissionContext").style.display = "none";
  document.getElementById("gradeBtn").disabled = true;

  if (assignmentId) {
    await loadSubmissionsForAssignment(assignmentId);
  } else {
    const submissionSelect = document.getElementById("submissionSelect");
    submissionSelect.innerHTML = '<option value="">-- Choose a submission --</option>';
    submissionSelect.disabled = true;
  }
});

// Handle submission selection
document.getElementById("submissionSelect").addEventListener("change", async (e) => {
  const submissionId = e.target.value;
  const assignmentId = document.getElementById("assignmentSelect").value;
  
  if (submissionId && assignmentId) {
    document.getElementById("submissionId").value = submissionId;
    document.getElementById("gradeBtn").disabled = false;
    await loadSubmissionContext(assignmentId, submissionId);
  } else {
    document.getElementById("submissionId").value = "";
    document.getElementById("submissionContext").style.display = "none";
    document.getElementById("gradeBtn").disabled = true;
  }
});

// Grade submission form
const gradeForm = document.getElementById("gradeForm");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

gradeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const assignmentId = document.getElementById("assignmentId").value;
  const submissionId = document.getElementById("submissionId").value;

  if (!assignmentId || !submissionId) {
    showError("Both Assignment ID and Submission ID are required");
    return;
  }

  // Hide all messages
  document.getElementById("gradeSuccess").style.display = "none";
  document.getElementById("gradeError").style.display = "none";
  document.getElementById("alreadyGraded").style.display = "none";
  document.getElementById("resultSection").style.display = "none";

  // First, check if submission exists and its status
  try {
    const checkResponse = await fetch(`${API_BASE}/submissions/${submissionId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (checkResponse.ok) {
      const submissionData = await checkResponse.json();
      
      // Check if already graded
      if (submissionData.status === "EVALUATED") {
        document.getElementById("alreadyGraded").style.display = "flex";
        
        // Show the existing results
        document.getElementById("resultSubmissionId").textContent = submissionData.id || submissionData.submission_id;
        document.getElementById("resultMarks").textContent = submissionData.marks_obtained || "N/A";
        document.getElementById("resultStatus").textContent = submissionData.status;
        document.getElementById("resultStatus").className = `status-badge status-evaluated`;
        document.getElementById("resultFeedback").textContent = submissionData.feedback || "No feedback";
        document.getElementById("resultSection").style.display = "block";
        
        return; // Don't proceed with grading
      }
    }
  } catch (error) {
    // If check fails, proceed with grading anyway
    console.log("Could not check submission status, proceeding with grading");
  }

  // Show AI grading status
  btnText.style.display = "none";
  btnLoader.style.display = "inline";
  document.getElementById("gradingStatus").style.display = "flex";

  try {
    // Endpoint: POST /grading/assignments/{assignment_id}/submissions/{submission_id}
    const response = await fetch(`${API_BASE}/grading/assignments/${assignmentId}/submissions/${submissionId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to grade submission");
    }

    // Hide grading status
    document.getElementById("gradingStatus").style.display = "none";

    // Show results
    document.getElementById("resultSubmissionId").textContent = data.submission_id || data.id;
    document.getElementById("resultMarks").textContent = data.marks_obtained || "N/A";
    document.getElementById("resultStatus").textContent = data.status;
    document.getElementById("resultStatus").className = `status-badge status-evaluated`;
    document.getElementById("resultFeedback").textContent = data.feedback || "No feedback";
    document.getElementById("resultSection").style.display = "block";

    showSuccess("🎉 Submission graded successfully by AI!");
    gradeForm.reset();

  } catch (error) {
    document.getElementById("gradingStatus").style.display = "none";
    showError(error.message);
  } finally {
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
});

function showError(message) {
  const el = document.getElementById("gradeError");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("gradeSuccess").style.display = "none";
}

function showSuccess(message) {
  const el = document.getElementById("gradeSuccess");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("gradeError").style.display = "none";
}

// Load assignments on page load
loadAssignments();
