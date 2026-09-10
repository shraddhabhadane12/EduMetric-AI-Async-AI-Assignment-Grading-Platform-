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

// Load assignments
async function loadAssignments() {
  document.getElementById("loadingMsg").style.display = "block";
  document.getElementById("noAssignments").style.display = "none";
  document.getElementById("assignmentsList").innerHTML = "";

  try {
    // Endpoint: GET /assignments
    const response = await fetch(`${API_BASE}/assignments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const assignments = await response.json();

    document.getElementById("loadingMsg").style.display = "none";

    // Filter assignments for teachers - show only their own
    let filteredAssignments = assignments;
    if (user.role === "teacher") {
      filteredAssignments = assignments.filter(a => a.teacher_id === parseInt(user.sub));
    }

    if (filteredAssignments.length === 0) {
      document.getElementById("noAssignments").style.display = "block";
      return;
    }

    displayAssignments(filteredAssignments);

  } catch (error) {
    document.getElementById("loadingMsg").style.display = "none";
    console.error(error);
  }
}

function displayAssignments(assignments) {
  const list = document.getElementById("assignmentsList");
  list.innerHTML = "";

  assignments.forEach(assignment => {
    const item = document.createElement("div");
    item.className = "assignment-item";

    const header = document.createElement("div");
    header.className = "assignment-header";
    header.innerHTML = `
      <span class="assignment-title">${assignment.title || "Untitled"}</span>
      <span class="assignment-id">ID: ${assignment.id}</span>
    `;

    const content = document.createElement("div");
    content.className = "assignment-content";

    if (user.role === "student") {
      // Students see only basic info in list view
      content.innerHTML = `
        <div class="assignment-meta">
          <strong>Maximum Marks:</strong> ${assignment.max_marks || "N/A"}
        </div>
        <p class="view-hint">Click "View Details" to see full assignment reference</p>
      `;
    } else {
      // Teachers see detailed info about their assignment
      content.innerHTML = `
        <div class="assignment-meta">
          <strong>Maximum Marks:</strong> ${assignment.max_marks || "N/A"}
        </div>
        <div class="assignment-meta">
          <strong>Status:</strong> ${assignment.is_active ? "Active" : "Inactive"}
        </div>
      `;
    }

    const actions = document.createElement("div");
    actions.className = "assignment-actions";

    if (user.role === "student") {
      const viewBtn = document.createElement("button");
      viewBtn.className = "btn btn-secondary";
      viewBtn.textContent = "View Details";
      viewBtn.onclick = () => {
        window.location.href = `assignment-detail.html?id=${assignment.id}`;
      };
      
      const submitBtn = document.createElement("button");
      submitBtn.className = "btn btn-primary";
      submitBtn.textContent = "Submit Assignment";
      submitBtn.onclick = () => {
        localStorage.setItem("selectedAssignmentId", assignment.id);
        window.location.href = "submit.html";
      };
      
      actions.appendChild(viewBtn);
      actions.appendChild(submitBtn);
    } else {
      // Teacher buttons - only View Submissions
      const viewSubmissionsBtn = document.createElement("button");
      viewSubmissionsBtn.className = "btn btn-primary";
      viewSubmissionsBtn.textContent = "📋 View Submissions";
      viewSubmissionsBtn.onclick = () => {
        window.location.href = `view-submissions.html?assignment_id=${assignment.id}`;
      };
      
      actions.appendChild(viewSubmissionsBtn);
    }

    item.appendChild(header);
    item.appendChild(content);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

// Load assignments on page load
loadAssignments();
