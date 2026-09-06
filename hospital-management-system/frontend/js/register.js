const alertBox = document.getElementById("alertBox");

function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const data = await Api.post("/auth/register", { username, email, password, role });
    Api.setSession(data.token, data.username, data.role);
    showAlert("Account created! Redirecting...", "success");
    setTimeout(() => (window.location.href = "dashboard.html"), 800);
  } catch (err) {
    showAlert(err.message);
  }
});
