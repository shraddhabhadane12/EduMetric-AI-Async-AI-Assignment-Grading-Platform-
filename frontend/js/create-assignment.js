const API_BASE = "http://localhost:8000";

// Auth check
const token = localStorage.getItem("accessToken");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "teacher") {
  alert("Only teachers can create assignments");
  window.location.href = "dashboard.html";
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Create assignment form
const createForm = document.getElementById("createForm");
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const aim_ref = document.getElementById("aim_ref").value.trim();
  const objectives_ref = document.getElementById("objectives_ref").value.trim();
  const code_ref = document.getElementById("code_ref").value.trim();
  const conclusion_ref = document.getElementById("conclusion_ref").value.trim();
  const max_marks = parseFloat(document.getElementById("max_marks").value);

  if (!title) {
    showError("Title is required");
    return;
  }

  try {
    // Endpoint: POST /assignments
    const response = await fetch(`${API_BASE}/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        aim_ref,
        objectives_ref,
        code_ref,
        conclusion_ref,
        max_marks,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create assignment");
    }

    const assignmentId = data.id;
    
    showSuccess(`Assignment created successfully! ID: ${assignmentId}`);
    
    // Show View Submissions button
    const successDiv = document.getElementById("createSuccess");
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "📋 View Submissions";
    viewBtn.className = "btn btn-primary";
    viewBtn.style.marginTop = "10px";
    viewBtn.style.marginRight = "10px";
    viewBtn.onclick = () => {
      window.location.href = `view-submissions.html?assignment_id=${assignmentId}`;
    };
    
    const assignmentsBtn = document.createElement("button");
    assignmentsBtn.textContent = "📋 View All Assignments";
    assignmentsBtn.className = "btn btn-secondary";
    assignmentsBtn.style.marginTop = "10px";
    assignmentsBtn.onclick = () => {
      window.location.href = "assignments.html";
    };
    
    successDiv.appendChild(document.createElement("br"));
    successDiv.appendChild(viewBtn);
    successDiv.appendChild(assignmentsBtn);
    
    createForm.reset();

  } catch (error) {
    showError(error.message);
  }
});

function showError(message) {
  const el = document.getElementById("createError");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("createSuccess").style.display = "none";
}

function showSuccess(message) {
  const el = document.getElementById("createSuccess");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("createError").style.display = "none";
}
