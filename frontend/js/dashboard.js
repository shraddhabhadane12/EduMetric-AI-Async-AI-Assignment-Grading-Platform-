// Auth check
const token = localStorage.getItem("accessToken");
if (!token) {
  window.location.href = "login.html";
}

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) {
  window.location.href = "login.html";
}

// Display user info
document.getElementById("userEmail").textContent = user.email;
document.getElementById("userRole").textContent = user.role.toUpperCase();
document.getElementById("welcomeText").textContent = `Welcome back, ${user.email}!`;

// Show/hide cards based on role
if (user.role === "student") {
  document.querySelectorAll(".student-only").forEach(el => el.style.display = "block");
  document.querySelectorAll(".teacher-only").forEach(el => el.style.display = "none");
} else if (user.role === "teacher") {
  document.querySelectorAll(".teacher-only").forEach(el => el.style.display = "block");
  document.querySelectorAll(".student-only").forEach(el => el.style.display = "none");
}

// Button handlers
document.getElementById("viewAssignmentsCard").querySelector("button").onclick = () => {
  window.location.href = "assignments.html";
};

// Student actions
const submitTextCard = document.getElementById("submitTextCard");
if (submitTextCard) {
  submitTextCard.querySelector("button").onclick = () => {
    window.location.href = "submit.html";
  };
}

const submitPdfCard = document.getElementById("submitPdfCard");
if (submitPdfCard) {
  submitPdfCard.querySelector("button").onclick = () => {
    window.location.href = "submit-pdf.html";
  };
}

const mySubmissionsCard = document.getElementById("mySubmissionsCard");
if (mySubmissionsCard) {
  mySubmissionsCard.querySelector("button").onclick = () => {
    window.location.href = "my-submissions.html";
  };
}

// Teacher actions
const createAssignmentCard = document.getElementById("createAssignmentCard");
if (createAssignmentCard) {
  createAssignmentCard.querySelector("button").onclick = () => {
    window.location.href = "create-assignment.html";
  };
}

const uploadPdfCard = document.getElementById("uploadPdfCard");
if (uploadPdfCard) {
  uploadPdfCard.querySelector("button").onclick = () => {
    window.location.href = "upload-pdf.html";
  };
}

const viewSubmissionsCard = document.getElementById("viewSubmissionsCard");
if (viewSubmissionsCard) {
  viewSubmissionsCard.querySelector("button").onclick = () => {
    window.location.href = "view-submissions.html";
  };
}

const gradeCard = document.getElementById("gradeCard");
if (gradeCard) {
  gradeCard.querySelector("button").onclick = () => {
    window.location.href = "grading.html";
  };
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};
