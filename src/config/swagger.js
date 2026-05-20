import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Task Manager API",
        version: "1.0.0",
        description: "Backend API for Task Manager — JWT Auth, CRUD Tasks, Role-based Access"
    },
    servers: [
        { url: "http://localhost:3000", description: "Development server" }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    username: { type: "string", example: "john_doe" },
                    email: { type: "string", example: "john@example.com" },
                    role: { type: "string", enum: ["user", "admin"], example: "user" }
                }
            },
            Task: {
                type: "object",
                properties: {
                    _id: { type: "string", example: "664a1b2c3d4e5f6789012345" },
                    title: { type: "string", example: "Complete assignment" },
                    description: { type: "string", example: "Finish the backend API" },
                    status: { type: "string", enum: ["pending", "in-progress", "completed"], example: "pending" },
                    priority: { type: "string", enum: ["low", "medium", "high"], example: "medium" },
                    createdBy: { type: "string", example: "664a1b2c3d4e5f6789012345" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            }
        }
    },
    paths: {
        // ── Auth Routes ─────────────────────────────────
        "/api/v1/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["username", "email", "password"],
                                properties: {
                                    username: { type: "string", example: "john_doe" },
                                    email: { type: "string", example: "john@example.com" },
                                    password: { type: "string", example: "password123" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "User registered successfully" },
                    400: { description: "Validation failed" },
                    409: { description: "Username or email already exists" }
                }
            }
        },
        "/api/v1/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", example: "john@example.com" },
                                    password: { type: "string", example: "password123" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "User logged in successfully" },
                    400: { description: "Validation failed" },
                    401: { description: "Invalid credentials" }
                }
            }
        },
        "/api/v1/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Get current logged-in user",
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: "User fetched successfully" },
                    401: { description: "Unauthorized" }
                }
            }
        },
        "/api/v1/auth/refresh-token": {
            get: {
                tags: ["Auth"],
                summary: "Refresh access token using refresh token cookie",
                responses: {
                    200: { description: "Access token refreshed successfully" },
                    401: { description: "Unauthorized — invalid or expired refresh token" }
                }
            }
        },

        // ── Task Routes ─────────────────────────────────
        "/api/v1/tasks": {
            post: {
                tags: ["Tasks"],
                summary: "Create a new task",
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["title"],
                                properties: {
                                    title: { type: "string", example: "Complete assignment" },
                                    description: { type: "string", example: "Finish the backend API" },
                                    status: { type: "string", enum: ["pending", "in-progress", "completed"] },
                                    priority: { type: "string", enum: ["low", "medium", "high"] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "Task created successfully" },
                    400: { description: "Validation failed" },
                    401: { description: "Unauthorized" }
                }
            },
            get: {
                tags: ["Tasks"],
                summary: "Get all tasks for current user",
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: "Tasks fetched successfully" },
                    401: { description: "Unauthorized" }
                }
            }
        },
        "/api/v1/tasks/{id}": {
            get: {
                tags: ["Tasks"],
                summary: "Get a single task by ID",
                security: [{ BearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Task ID" }],
                responses: {
                    200: { description: "Task fetched successfully" },
                    400: { description: "Invalid task ID" },
                    401: { description: "Unauthorized" },
                    404: { description: "Task not found" }
                }
            },
            put: {
                tags: ["Tasks"],
                summary: "Update a task",
                security: [{ BearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Task ID" }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    status: { type: "string", enum: ["pending", "in-progress", "completed"] },
                                    priority: { type: "string", enum: ["low", "medium", "high"] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Task updated successfully" },
                    400: { description: "Invalid task ID or validation failed" },
                    401: { description: "Unauthorized" },
                    404: { description: "Task not found" }
                }
            },
            delete: {
                tags: ["Tasks"],
                summary: "Delete a task",
                security: [{ BearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Task ID" }],
                responses: {
                    200: { description: "Task deleted successfully" },
                    400: { description: "Invalid task ID" },
                    401: { description: "Unauthorized" },
                    404: { description: "Task not found" }
                }
            }
        },

        // ── Admin Routes ────────────────────────────────
        "/api/v1/admin/users": {
            get: {
                tags: ["Admin"],
                summary: "Get all users (admin only)",
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: "Users fetched successfully" },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden — not an admin" }
                }
            }
        }
    }
};

const swaggerSpec = swaggerJSDoc({
    swaggerDefinition,
    apis: [] // We defined everything inline above, no need to scan files
});

export default swaggerSpec;
