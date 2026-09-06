// Central API client. All requests go through here so the JWT header and
// error handling only need to be written once.
const API_BASE_URL = "http://localhost:8080/api";

const Api = {
  getToken() {
    return localStorage.getItem("hms_token");
  },

  setSession(token, username, role) {
    localStorage.setItem("hms_token", token);
    localStorage.setItem("hms_username", username);
    localStorage.setItem("hms_role", role);
  },

  clearSession() {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_username");
    localStorage.removeItem("hms_role");
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  async request(path, { method = "GET", body = null } = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    // Session expired or invalid - bounce back to login rather than
    // showing a confusing 401 in the UI.
    if (response.status === 401) {
      this.clearSession();
      window.location.href = "/index.html";
      throw new Error("Session expired");
    }

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.error || `Request failed (${response.status})`);
    }
    return data;
  },

  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: "POST", body }); },
  put(path, body) { return this.request(path, { method: "PUT", body }); },
  del(path) { return this.request(path, { method: "DELETE" }); },
};
