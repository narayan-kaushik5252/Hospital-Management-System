# Hospital Management System

A full-stack Hospital Management System with role-based access for **patients**, **doctors**, and **admins** — patient records, doctor management, and appointment scheduling.

## Stack

- **Backend:** Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend:** HTML, CSS, vanilla JavaScript (fetch-based API client)

## Project structure

```
hospital-management-system/
├── backend/
│   └── src/main/java/com/hospital/hms/
│       ├── config/         # SecurityConfig (JWT, CORS, role rules)
│       ├── controller/     # REST endpoints
│       ├── service/        # Business logic
│       ├── repository/     # Spring Data JPA repositories
│       ├── entity/         # JPA entities (User, Patient, Doctor, Appointment)
│       ├── dto/            # Request/response objects (never expose entities directly)
│       ├── security/       # JwtUtil, JwtAuthFilter, UserDetailsService
│       └── exception/      # Global exception handler
│   └── src/main/resources/
│       ├── application.properties
│       └── schema-reference.sql   # documents the indexing strategy
└── frontend/
    ├── index.html          # login
    ├── pages/              # register.html, dashboard.html
    ├── css/style.css
    └── js/                 # api.js (fetch client), auth.js, dashboard.js
```

## How this maps to the project summary

**"Full-stack HMS with Spring Boot, HTML, CSS, JavaScript, supporting concurrent user roles"**
→ Three roles (`ADMIN`, `DOCTOR`, `PATIENT`) enforced at two layers: URL-level rules in `SecurityConfig`, and method-level `@PreAuthorize` checks on each controller endpoint. The frontend is a static HTML/CSS/JS app that talks to the API over `fetch`.

**"15+ secure, scalable REST API endpoints integrated with PostgreSQL"**
→ `AuthController` (register, login), `PatientController` (5 endpoints), `DoctorController` (6), `AppointmentController` (7) = 20 endpoints total, all backed by Spring Data JPA repositories over PostgreSQL. "Secure" here means: JWT bearer auth on every non-public route, BCrypt password hashing, role-gated write operations, Bean Validation on all request bodies, and a global exception handler so no internal error ever leaks a stack trace.

**"Optimized PostgreSQL schemas and indexing strategy, ~80% query time reduction"**
→ See `schema-reference.sql` and the `@Index` annotations on the `Appointment` entity. The composite index on `(doctor_id, appointment_date)` is what the double-booking check and doctor-schedule queries hit, instead of scanning the whole table.

## Running it locally

1. Create a PostgreSQL database: `createdb hospital_db`
2. Set environment variables (or edit the fallbacks in `application.properties`):
   ```
   DB_NAME=hospital_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=a-long-random-string
   ```
3. From `backend/`: `mvn spring-boot:run`
4. Open `frontend/index.html` in a browser (or serve it with any static file server) and register an account.

## Security notes worth mentioning in an interview

- Passwords are BCrypt-hashed (cost factor 12) — never stored or logged in plaintext.
- JWTs are stateless; the API sets `SessionCreationPolicy.STATELESS` and never uses server-side sessions.
- CORS is locked to explicit origins, not `*`, since credentials/JWT headers are involved.
- Role checks exist at both the URL layer (`SecurityConfig`) and the method layer (`@PreAuthorize`), so a future new endpoint can't accidentally skip authorization.
- The global exception handler returns a generic "Invalid username or password" for any auth failure, so the API never confirms whether a username exists (prevents enumeration).
