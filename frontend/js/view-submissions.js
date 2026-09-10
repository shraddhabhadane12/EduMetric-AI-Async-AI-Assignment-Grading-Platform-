const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "teacher") {
  alert("Only teachers can view submissions");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Check for assignment_id in URL (from assignments page)
const urlParams = new URLSearchParams(window.location.search);
const urlAssignmentId = urlParams.get("assignment_id");

// Load teacher's assignments
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

    // Filter to show only teacher's own assignments
    const teacherAssignments = assignments.filter(a => a.teacher_id === parseInt(user.sub));

    const select = document.getElementById("assignmentId");
    select.innerHTML = '<option value="">-- Select an assignment --</option>';

    teacherAssignments.forEach(a => {
      const option = document.createElement("option");
      option.value = a.id;
      option.textContent = `${a.title || "Untitled"} (ID: ${a.id})`;
      select.appendChild(option);
    });

    document.getElementById("assignmentsSelect").style.display = "block";

    // Auto-load if assignment_id in URL
    if (urlAssignmentId) {
      document.getElementById("assignmentId").value = urlAssignmentId;
      await loadSubmissions(urlAssignmentId);
    }

  } catch (error) {
    document.getElementById("loadingAssignments").style.display = "none";
    showSelectError(error.message);
  }
}

// Handle assignment selection
document.getElementById("assignmentId").addEventListener("change", async () => {
  const assignmentId = document.getElementById("assignmentId").value;
  if (assignmentId) {
    await loadSubmissions(assignmentId);
  } else {
    document.getElementById("submissionsSection").style.display = "none";
  }
});

// Load submissions for selected assignment
async function loadSubmissions(assignmentId) {
  document.getElementById("loadingSubmissions").style.display = "block";
  document.getElementById("submissionsList").innerHTML = "";
  document.getElementById("noSubmissions").style.display = "none";
  document.getElementById("submissionsSection").style.display = "block";

  try {
    // Endpoint: GET /submissions/assignment/{assignment_id}
    const response = await fetch(`${API_BASE}/submissions/assignment/${assignmentId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to load submissions");
    }

    document.getElementById("loadingSubmissions").style.display = "none";
    document.getElementById("submissionsTitle").textContent = `Submissions for: ${data.assignment_title}`;

    if (data.submissions.length === 0) {
      document.getElementById("noSubmissions").style.display = "block";
      return;
    }

    displaySubmissions(data.submissions);

  } catch (error) {
    document.getElementById("loadingSubmissions").style.display = "none";
    document.getElementById("submissionsSection").style.display = "none";
    showSelectError(error.message);
  }
}

function displaySubmissions(submissions) {
  const list = document.getElementById("submissionsList");
  list.innerHTML = "";

  const table = document.createElement("table");
  table.className = "submissions-table";
  
  table.innerHTML = `
    <thead>
      <tr>
        <th>Submission ID</th>
        <th>Student Email</th>
        <th>Student Name</th>
        <th>Submitted At</th>
        <th>Status</th>
        <th>Marks Obtained</th>
        <th>Feedback</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="tableBody"></tbody>
  `;
  
  list.appendChild(table);
  const tbody = document.getElementById("tableBody");

  submissions.forEach(sub => {
    const row = document.createElement("tr");
    
    const statusClass = sub.status === "EVALUATED" ? "status-evaluated" : 
                        sub.status === "PENDING" ? "status-pending" : "status-rejected";
    
    row.innerHTML = `
      <td>${sub.submission_id}</td>
      <td>${sub.student_email}</td>
      <td>${sub.student_name}</td>
      <td>${new Date(sub.submitted_at).toLocaleString()}</td>
      <td><span class="status-badge ${statusClass}">${sub.status}</span></td>
      <td class="marks-cell">${sub.marks_obtained !== null ? sub.marks_obtained : "Not Graded"}</td>
      <td class="feedback-cell">${sub.feedback || "No feedback"}</td>
      <td>
        <button class="btn-small btn-view" onclick="viewSubmissionDetail(${sub.submission_id})">View Details</button>
        ${sub.status === "PENDING" ? `<button class="btn-small btn-grade" onclick="gradeSubmission(${sub.submission_id})">Grade Now</button>` : ''}
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Close submissions list
document.getElementById("closeListBtn").addEventListener("click", () => {
  document.getElementById("submissionsSection").style.display = "none";
  document.getElementById("assignmentId").value = "";
});

// Helper functions for table actions
window.viewSubmissionDetail = function(submissionId) {
  window.location.href = `submission-detail.html?id=${submissionId}`;
};

window.gradeSubmission = function(submissionId) {
  const assignmentId = document.getElementById("assignmentId").value;
  window.location.href = `grading.html?assignment_id=${assignmentId}&submission_id=${submissionId}`;
};

function showSelectError(message) {
  const el = document.getElementById("selectError");
  el.textContent = message;
  el.style.display = "block";
}

// Load assignments on page load
loadAssignments();
