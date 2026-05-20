# Backend Developer Internship — Assignment Report

**Project**: Task Manager API  
**Candidate**: Pritish  
**Repository**: [github.com/pritish157/TaskManager](https://github.com/pritish157/TaskManager)  
**Date**: May 2026

---

## 1. Objective

Build a secure, role-based RESTful API for a Task Management system using the MERN stack. The application allows users to register, authenticate via JWT, and perform CRUD operations on their tasks. An admin role provides elevated access to manage users. A React frontend connects to the API for a complete full-stack experience.

---

## 2. Tech Stack & Dependencies

| Category | Technology | Purpose |
|----------|-----------|---------|
| Runtime | Node.js (v18+) | JavaScript runtime for server-side code |
| Framework | Express.js v5 | HTTP server, routing, and middleware pipeline |
| Database | MongoDB + Mongoose v9 | NoSQL document store with schema validation |
| Authentication | jsonwebtoken | Access & refresh token generation and verification |
| Password Security | bcryptjs | Industry-standard password hashing with salt |
| Input Validation | express-validator | Declarative validation and sanitization middleware |
| API Documentation | swagger-jsdoc + swagger-ui-express | Auto-generated interactive API docs (OpenAPI 3.0) |
| Frontend | React 19 (Vite) | Single-page application for user interface |
| HTTP Client | Axios | API communication with interceptors for JWT |
| Routing | react-router-dom v7 | Client-side page navigation |
| Dev Tools | nodemon, concurrently, morgan | Auto-restart, parallel servers, HTTP logging |

---

## 3. Architecture & Design Decisions

### 3.1 Folder Structure (MVC Pattern)

The project follows a clean **Model-View-Controller** architecture inside the `src/` directory:

```
src/
├── config/          → Environment config, DB connection, Swagger spec
├── controllers/     → Business logic (auth, task, admin)
├── middleware/       → Auth verification, role checks, error handling
├── models/          → Mongoose schemas (User, Task)
├── routes/          → Express route definitions
├── validators/      → express-validator rule sets
└── utils/           → Shared utilities (asyncHandler)
```

**Why this structure?**
- Separates concerns cleanly — routes don't contain logic, controllers don't handle validation
- Easy to navigate for reviewers and team members
- Scales naturally as new features are added

### 3.2 Authentication Strategy

I implemented a **dual-token JWT strategy**:

| Token | Secret | Expiry | Storage | Purpose |
|-------|--------|--------|---------|---------|
| Access Token | `JWT_SECRET` | 15 minutes | Client `localStorage` | Sent in `Authorization: Bearer <token>` header |
| Refresh Token | `JWT_REFRESH_SECRET` | 7 days | `httpOnly` cookie | Securely renews access tokens without re-login |

**Why separate secrets?** If one token is compromised, the other remains secure. The short-lived access token limits the damage window, while the refresh token in an httpOnly cookie is immune to XSS attacks.

### 3.3 Middleware Chain

Every protected request passes through a layered middleware pipeline:

```
Request → express-validator → validate() → protect → authorize(role) → Controller
            ↓                    ↓            ↓           ↓
        Validate input     Check errors   Verify JWT   Check role
        (sanitize)         (400 if bad)   (401 if no)  (403 if wrong)
```

### 3.4 Error Handling Strategy

Instead of scattering `try-catch` blocks in every controller, I implemented:

1. **`asyncHandler`** — A wrapper function that catches rejected promises and forwards errors to Express's error pipeline via `next(err)`
2. **Global Error Middleware** — A centralized handler that processes all errors and returns consistent JSON responses:

| Error Type | Status Code | Example |
|-----------|-------------|---------|
| Mongoose CastError | 400 | Invalid ObjectId format |
| Duplicate Key (11000) | 409 | Email already exists |
| Mongoose ValidationError | 400 | Missing required fields |
| Unknown/Server Error | 500 | Unhandled exceptions |

---

## 4. API Endpoints

### 4.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Create account with hashed password |
| `POST` | `/login` | Public | Verify credentials, return tokens |
| `GET` | `/me` | Protected | Return current user profile |
| `GET` | `/refresh-token` | Cookie | Issue new access token |

### 4.2 Tasks (`/api/v1/tasks`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Protected | Create a new task |
| `GET` | `/` | Protected | List all own tasks (sorted by newest) |
| `GET` | `/:id` | Protected | Get single task by ID |
| `PUT` | `/:id` | Protected | Update task fields |
| `DELETE` | `/:id` | Protected | Delete a task |

**Ownership Enforcement**: Every task query includes `createdBy: req.user._id` to ensure users can only access their own tasks. There is no way for User A to read, update, or delete User B's tasks.

### 4.3 Admin (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | Admin Only | List all registered users (passwords excluded) |

---

## 5. Data Models

### 5.1 User Schema

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | String | Required, unique, 3-30 chars, alphanumeric + underscore only |
| `email` | String | Required, unique, valid email format, normalized |
| `password` | String | Required, min 8 chars, hashed with bcrypt (never returned in API responses) |
| `role` | String | Enum: `user`, `admin`. Default: `user` |
| `createdAt` | Date | Auto-generated by Mongoose timestamps |
| `updatedAt` | Date | Auto-generated by Mongoose timestamps |

### 5.2 Task Schema

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | Required, trimmed |
| `description` | String | Optional |
| `status` | String | Enum: `pending`, `in-progress`, `completed`. Default: `pending` |
| `priority` | String | Enum: `low`, `medium`, `high`. Default: `medium` |
| `createdBy` | ObjectId | Reference to User model (auto-set from JWT) |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

---

## 6. Input Validation

All user input is validated server-side using **express-validator** before reaching the controller.

### 6.1 Registration Validation

| Field | Rules |
|-------|-------|
| `username` | Required, 3-30 chars, alphanumeric + underscore only, forced lowercase |
| `email` | Required, valid email format, normalized |
| `password` | Min 8 chars, must contain: 1 lowercase, 1 uppercase, 1 number |
| `password` (cross-field) | Must not contain the username or email local part |

### 6.2 Task Validation

| Operation | Rules |
|-----------|-------|
| Create | `title` required; `status` and `priority` must be valid enum values |
| Update | All fields optional; enum values validated if provided |
| Get/Delete | `:id` param must be a valid MongoDB ObjectId |

### 6.3 Validation Response Format

```json
{
    "message": "Validation failed",
    "errors": [
        { "field": "password", "message": "Password must be at least 8 characters" },
        { "field": "password", "message": "Password must not contain your username" }
    ]
}
```

---

## 7. Security Measures

| Measure | Implementation |
|---------|---------------|
| **Password Hashing** | bcryptjs with salt round 10 (≈100ms per hash, resistant to brute-force) |
| **Separate JWT Secrets** | Access and refresh tokens use different secrets |
| **httpOnly Cookies** | Refresh token is stored in a cookie with `httpOnly`, `secure`, `sameSite: strict` flags — immune to XSS |
| **Role-Based Access** | `authorize("admin")` middleware blocks non-admin users (403 Forbidden) |
| **Ownership Isolation** | All task queries are scoped to `createdBy: req.user._id` |
| **Password Content Rules** | Password cannot contain the username or email |
| **Password Exclusion** | Password field is never included in any API response (`select("-password")`) |
| **Input Sanitization** | `trim()`, `normalizeEmail()`, `toLowerCase()` applied to inputs |
| **Centralized Errors** | No raw stack traces leak to the client — all errors are formatted |

---

## 8. Frontend

### 8.1 Pages

| Page | Features |
|------|----------|
| **Register** | Form with real-time validation, password strength checklist (6 rules), auto-lowercase username, API error display |
| **Login** | Email + password form, success/error messages, redirect to dashboard |
| **Dashboard** | Task list with status/priority badges, inline create/edit form, delete with confirmation, user info in navbar, logout |

### 8.2 Key Frontend Features

- **Axios Interceptors**: Automatically attaches JWT to every request and refreshes expired tokens transparently
- **Real-time Validation**: Password rules update live as the user types — green checkmarks for passing rules
- **Responsive Design**: Mobile-friendly dark theme with modern aesthetics
- **Error Handling**: All API errors are caught and displayed as user-friendly messages

---

## 9. API Documentation

Interactive **Swagger UI** documentation is available at:

```
http://localhost:3000/api-docs
```

Features:
- All 10 endpoints documented with request/response schemas
- Example values for every field
- "Authorize" button to test protected endpoints with JWT
- Organized by tags: Auth, Tasks, Admin
- Response codes documented for each endpoint

---

## 10. How to Run

```bash
# 1. Clone
git clone https://github.com/pritish157/TaskManager.git
cd TaskManager

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Create .env file in root
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# JWT_REFRESH_SECRET=your_refresh_secret

# 4. Start both servers
npm run dev
```

| Server | URL |
|--------|-----|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| Swagger Docs | http://localhost:3000/api-docs |

---

## 11. Scalability Considerations

If this application needed to scale to production-level traffic, the following strategies would be applied:

### Microservices
Split the monolith into independent services (Auth Service, Task Service, Admin Service), each with its own database. Services communicate via REST APIs or a message queue like **RabbitMQ/Kafka**. This allows each service to be deployed, scaled, and maintained independently.

### Caching (Redis)
- Cache frequently accessed data (user profiles, task lists) to reduce database load
- Store JWT blacklists for logout functionality
- Use as a session store for rate limiting counters

### Load Balancing
- Use **Nginx** or cloud load balancers (AWS ALB, GCP LB) to distribute traffic
- Run multiple Node.js instances via **PM2 cluster mode** or **Kubernetes pods**
- Implement health checks for automatic failover

### Database Optimization
- Add **compound indexes** on frequently queried fields (`{ createdBy: 1, createdAt: -1 }`)
- Implement **cursor-based pagination** for large task lists
- Use **MongoDB replica sets** for read scaling and high availability

### Rate Limiting
- Add `express-rate-limit` to prevent brute-force attacks on login endpoints
- Implement per-user API rate limits to prevent abuse

---

## 12. Deliverables Checklist

| # | Requirement | Status | Evidence |
|---|------------|--------|----------|
| 1 | Backend hosted on GitHub with README | ✅ | [Repository Link](https://github.com/pritish157/TaskManager) |
| 2 | Working APIs for Authentication & CRUD | ✅ | 10 REST endpoints with JWT |
| 3 | Basic frontend UI connected to APIs | ✅ | React app with Register, Login, Dashboard |
| 4 | API documentation (Swagger) | ✅ | Interactive docs at `/api-docs` |
| 5 | Scalability note | ✅ | Section 11 of this report |

---

*Report generated for Backend Developer Internship Assignment submission.*
