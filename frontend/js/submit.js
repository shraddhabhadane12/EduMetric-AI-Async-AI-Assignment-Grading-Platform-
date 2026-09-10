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

    // If assignment was pre-selected
    const preSelectedId = localStorage.getItem("selectedAssignmentId");
    if (preSelectedId) {
      select.value = preSelectedId;
      handleAssignmentSelect();
      localStorage.removeItem("selectedAssignmentId");
    }

  } catch (error) {
    document.getElementById("loadingAssignments").style.display = "none";
    console.error(error);
  }
}

// Handle assignment selection
document.getElementById("assignmentId").addEventListener("change", handleAssignmentSelect);

function handleAssignmentSelect() {
  const value = document.getElementById("assignmentId").value;
  if (value) {
    selectedAssignmentId = value;
    document.getElementById("submitSection").style.display = "block";
  } else {
    selectedAssignmentId = null;
    document.getElementById("submitSection").style.display = "none";
  }
}

// Submit form
const submitForm = document.getElementById("submitForm");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

submitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedAssignmentId) {
    showError("Please select an assignment");
    return;
  }

  const aim_ans = document.getElementById("aim_ans").value.trim();
  const objectives_ans = document.getElementById("objectives_ans").value.trim();
  const code_ans = document.getElementById("code_ans").value.trim();
  const conclusion_ans = document.getElementById("conclusion_ans").value.trim();

  // Show loading
  btnText.style.display = "none";
  btnLoader.style.display = "inline";

  try {
    // Endpoint: POST /assignments/{assignment_id}/submit
    const response = await fetch(`${API_BASE}/assignments/${selectedAssignmentId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        assignment_id: parseInt(selectedAssignmentId),
        aim_ans,
        objectives_ans,
        code_ans,
        conclusion_ans,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to submit assignment");
    }

    showSuccess(`Assignment submitted successfully! Submission ID: ${data.id}`);
    submitForm.reset();

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);

  } catch (error) {
    showError(error.message);
  } finally {
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
});

function showError(message) {
  const el = document.getElementById("submitError");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("submitSuccess").style.display = "none";
}

function showSuccess(message) {
  const el = document.getElementById("submitSuccess");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("submitError").style.display = "none";
}

// Load assignments on page load
loadAssignments();
