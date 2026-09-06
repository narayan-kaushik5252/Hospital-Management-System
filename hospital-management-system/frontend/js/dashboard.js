if (!Api.isLoggedIn()) {
  window.location.href = "../index.html";
}

const role = localStorage.getItem("hms_role");
document.getElementById("userTag").textContent =
  `${localStorage.getItem("hms_username")} · ${role}`;

document.getElementById("logoutBtn").addEventListener("click", () => {
  Api.clearSession();
  window.location.href = "../index.html";
});

// ---------- View switching ----------
const views = ["patients", "doctors", "appointments"];
function showView(name) {
  views.forEach((v) => {
    document.getElementById(`view-${v}`).classList.toggle("hidden", v !== name);
    document.getElementById(`nav${cap(v)}`).classList.toggle("active", v === name);
  });
  loadView(name);
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

document.getElementById("navPatients").addEventListener("click", (e) => { e.preventDefault(); showView("patients"); });
document.getElementById("navDoctors").addEventListener("click", (e) => { e.preventDefault(); showView("doctors"); });
document.getElementById("navAppointments").addEventListener("click", (e) => { e.preventDefault(); showView("appointments"); });

function loadView(name) {
  if (name === "patients") loadPatients();
  if (name === "doctors") loadDoctors();
  if (name === "appointments") loadAppointments();
}

// ---------- Modal helpers ----------
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalForm = document.getElementById("modalForm");

function openModal(title, fieldsHtml, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML = fieldsHtml + `
    <div style="display:flex; gap:8px; margin-top:20px;">
      <button type="submit" class="primary-btn" style="flex:1;">Save</button>
      <button type="button" id="cancelModalBtn" style="flex:1; background:#e5e7eb;">Cancel</button>
    </div>`;
  modalOverlay.classList.remove("hidden");

  document.getElementById("cancelModalBtn").onclick = closeModal;
  modalForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit();
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };
}
function closeModal() { modalOverlay.classList.add("hidden"); }

// ---------- Patients ----------
async function loadPatients() {
  const tbody = document.getElementById("patientsTableBody");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
  try {
    const patients = await Api.get("/patients");
    tbody.innerHTML = patients.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.firstName} ${p.lastName}</td>
        <td>${p.dateOfBirth ?? "-"}</td>
        <td>${p.gender ?? "-"}</td>
        <td>${p.phone ?? "-"}</td>
        <td>
          <button class="edit-btn" onclick="editPatient(${p.id})">Edit</button>
          <button class="delete-btn" onclick="deletePatient(${p.id})">Delete</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

function patientFormFields(p = {}) {
  return `
    <label>First Name</label><input name="firstName" value="${p.firstName ?? ""}" required>
    <label>Last Name</label><input name="lastName" value="${p.lastName ?? ""}" required>
    <label>Date of Birth</label><input type="date" name="dateOfBirth" value="${p.dateOfBirth ?? ""}">
    <label>Gender</label><input name="gender" value="${p.gender ?? ""}">
    <label>Phone</label><input name="phone" value="${p.phone ?? ""}">
    <label>Address</label><input name="address" value="${p.address ?? ""}">
  `;
}

document.getElementById("addPatientBtn").addEventListener("click", () => {
  openModal("Add Patient", patientFormFields(), async () => {
    const fd = new FormData(modalForm);
    await Api.post("/patients", Object.fromEntries(fd));
    loadPatients();
  });
});

async function editPatient(id) {
  const p = await Api.get(`/patients/${id}`);
  openModal("Edit Patient", patientFormFields(p), async () => {
    const fd = new FormData(modalForm);
    await Api.put(`/patients/${id}`, Object.fromEntries(fd));
    loadPatients();
  });
}

async function deletePatient(id) {
  if (!confirm("Delete this patient record?")) return;
  await Api.del(`/patients/${id}`);
  loadPatients();
}

// ---------- Doctors ----------
async function loadDoctors() {
  const tbody = document.getElementById("doctorsTableBody");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
  try {
    const doctors = await Api.get("/doctors");
    tbody.innerHTML = doctors.map(d => `
      <tr>
        <td>${d.id}</td>
        <td>Dr. ${d.firstName} ${d.lastName}</td>
        <td>${d.specialization}</td>
        <td>${d.yearsExperience ?? "-"} yrs</td>
        <td>${d.available ? "Yes" : "No"}</td>
        <td>
          <button class="edit-btn" onclick="editDoctor(${d.id})">Edit</button>
          <button class="delete-btn" onclick="deleteDoctor(${d.id})">Delete</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

function doctorFormFields(d = {}) {
  return `
    <label>First Name</label><input name="firstName" value="${d.firstName ?? ""}" required>
    <label>Last Name</label><input name="lastName" value="${d.lastName ?? ""}" required>
    <label>Specialization</label><input name="specialization" value="${d.specialization ?? ""}" required>
    <label>Phone</label><input name="phone" value="${d.phone ?? ""}">
    <label>Years of Experience</label><input type="number" name="yearsExperience" value="${d.yearsExperience ?? ""}">
  `;
}

document.getElementById("addDoctorBtn").addEventListener("click", () => {
  openModal("Add Doctor", doctorFormFields(), async () => {
    const fd = new FormData(modalForm);
    await Api.post("/doctors", Object.fromEntries(fd));
    loadDoctors();
  });
});

async function editDoctor(id) {
  const d = await Api.get(`/doctors/${id}`);
  openModal("Edit Doctor", doctorFormFields(d), async () => {
    const fd = new FormData(modalForm);
    await Api.put(`/doctors/${id}`, Object.fromEntries(fd));
    loadDoctors();
  });
}

async function deleteDoctor(id) {
  if (!confirm("Delete this doctor?")) return;
  await Api.del(`/doctors/${id}`);
  loadDoctors();
}

// ---------- Appointments ----------
async function loadAppointments() {
  const tbody = document.getElementById("appointmentsTableBody");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
  try {
    const appts = await Api.get("/appointments");
    tbody.innerHTML = appts.map(a => `
      <tr>
        <td>${a.id}</td>
        <td>${a.patientName}</td>
        <td>${a.doctorName}</td>
        <td>${new Date(a.appointmentDate).toLocaleString()}</td>
        <td>${a.status}</td>
        <td>
          <button class="delete-btn" onclick="deleteAppointment(${a.id})">Cancel</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

function appointmentFormFields() {
  return `
    <label>Patient ID</label><input type="number" name="patientId" required>
    <label>Doctor ID</label><input type="number" name="doctorId" required>
    <label>Date &amp; Time</label><input type="datetime-local" name="appointmentDate" required>
    <label>Reason</label><input name="reason">
  `;
}

document.getElementById("addAppointmentBtn").addEventListener("click", () => {
  openModal("Book Appointment", appointmentFormFields(), async () => {
    const fd = new FormData(modalForm);
    const payload = Object.fromEntries(fd);
    payload.appointmentDate = new Date(payload.appointmentDate).toISOString();
    await Api.post("/appointments", payload);
    loadAppointments();
  });
});

async function deleteAppointment(id) {
  if (!confirm("Cancel this appointment?")) return;
  await Api.del(`/appointments/${id}`);
  loadAppointments();
}

// ---------- Init ----------
showView("patients");
