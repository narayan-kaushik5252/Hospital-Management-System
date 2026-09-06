if (Api.isLoggedIn()) {
  window.location.href = "pages/dashboard.html";
}

const alertBox = document.getElementById("alertBox");

function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const data = await Api.post("/auth/login", { username, password });
    Api.setSession(data.token, data.username, data.role);
    window.location.href = "pages/dashboard.html";
  } catch (err) {
    showAlert(err.message);
  }
});
