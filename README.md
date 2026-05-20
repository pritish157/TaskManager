# Task Manager — MERN Stack Backend

A secure, role-based Task Management API built with **Node.js**, **Express**, **MongoDB**, and a **React** frontend. Features JWT authentication, CRUD operations, input validation, and interactive API documentation.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Validation** | express-validator |
| **Docs** | Swagger (OpenAPI 3.0) |
| **Frontend** | React (Vite) |

---

## 📁 Project Structure

```
├── server.js                       # Entry point
├── src/
│   ├── app.js                      # Express app setup (CORS, middleware, routes)
│   ├── config/
│   │   ├── config.js               # Environment variable validation
│   │   ├── database.js             # MongoDB connection
│   │   └── swagger.js              # OpenAPI 3.0 spec
│   ├── controllers/
│   │   ├── auth.controllers.js     # Register, Login, GetMe, RefreshToken
│   │   ├── task.controller.js      # CRUD operations (5 endpoints)
│   │   └── admin.controller.js     # Admin-only: list all users
│   ├── middleware/
│   │   ├── auth.middleware.js       # protect (JWT verify) + authorize (role check)
│   │   └── error.middleware.js      # Global error handler
│   ├── models/
│   │   ├── user.model.js           # User schema (username, email, password, role)
│   │   └── task.model.js           # Task schema (title, description, status, priority)
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── task.route.js
│   │   └── admin.route.js
│   ├── validators/
│   │   ├── auth.validator.js       # Register/Login validation rules
│   │   └── task.validator.js       # Task CRUD validation rules
│   └── utils/
│       └── asyncHandler.js         # Async error wrapper
├── client/                         # React frontend (Vite)
│   └── src/
│       ├── api/axios.js            # Axios instance with JWT interceptors
│       ├── pages/
│       │   ├── Register.jsx        # Registration with real-time validation
│       │   ├── Login.jsx           # Login form
│       │   └── Dashboard.jsx       # Task CRUD UI
│       ├── App.jsx                 # Router
│       └── index.css               # Dark theme styling
└── .gitignore
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/pritish157/TaskManager.git
cd TaskManager
```

### 2. Install dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Create `.env` file

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### 4. Run the application

```bash
npm run dev
```

This starts **both** servers concurrently:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:3000/api-docs

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register a new user |
| `POST` | `/api/v1/auth/login` | Public | Login and receive tokens |
| `GET` | `/api/v1/auth/me` | Protected | Get current user profile |
| `GET` | `/api/v1/auth/refresh-token` | Cookie | Refresh access token |

### Tasks (Protected — requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/tasks` | Create a new task |
| `GET` | `/api/v1/tasks` | Get all tasks (own tasks only) |
| `GET` | `/api/v1/tasks/:id` | Get a single task |
| `PUT` | `/api/v1/tasks/:id` | Update a task |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task |

### Admin (Protected — admin role only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/users` | Get all registered users |

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt round 10
- **Dual JWT Strategy**: Separate secrets for access tokens (15min) and refresh tokens (7 days)
- **httpOnly Cookies**: Refresh token stored in secure, httpOnly, sameSite=strict cookie
- **Role-Based Access**: `user` and `admin` roles with middleware enforcement
- **Ownership Isolation**: Users can only access their own tasks
- **Input Validation**: Server-side validation on all endpoints using express-validator
- **Password Strength Rules**: Min 8 chars, uppercase, lowercase, number, no username/email in password
- **Centralized Error Handling**: Global error middleware catches all unhandled errors

---

## 📖 API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:3000/api-docs
```

All endpoints are documented with request/response schemas, status codes, and authentication requirements.

---

## 🖥️ Frontend Features

- **Register Page**: Real-time password strength checker with 6 validation rules
- **Login Page**: Clean form with API error display
- **Dashboard**: Full task CRUD with status/priority badges, inline edit, and delete confirmation
- **Auto Token Refresh**: Axios interceptor automatically refreshes expired access tokens
- **Dark Theme**: Modern dark UI with purple accent palette

---

## 📈 Scalability Considerations

If this application needed to scale to handle high traffic and a larger user base, the following strategies would be applied:

### Microservices Architecture
The monolith could be split into independent services (Auth Service, Task Service, Admin Service), each with its own database. Services would communicate via REST or a message queue like **RabbitMQ**. This allows each service to scale independently based on demand.

### Caching
Frequently accessed data (e.g., user profiles, task lists) could be cached using **Redis**. This would reduce database load significantly. JWT blacklisting (for logout) would also benefit from Redis's fast key-value lookups.

### Load Balancing
A reverse proxy like **Nginx** or a cloud load balancer (AWS ALB) would distribute incoming requests across multiple server instances. Combined with **horizontal scaling** (running multiple Node.js processes via PM2 cluster mode or Kubernetes pods), this ensures high availability.

### Database Optimization
- **Indexing**: Add indexes on frequently queried fields (`email`, `createdBy`, `status`)
- **Pagination**: Implement cursor-based pagination for task lists to avoid loading all records
- **Read Replicas**: Use MongoDB replica sets to distribute read operations

### Rate Limiting
Add rate limiting middleware (e.g., `express-rate-limit`) to prevent brute-force attacks on auth endpoints and API abuse.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend concurrently |
| `npm run dev:server` | Start backend only (with nodemon) |
| `npm run dev:client` | Start frontend only (Vite dev server) |

---

## 👤 Author

**Pritish** — [GitHub](https://github.com/pritish157)
