import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import authRouter from './routes/auth.route.js';
import taskRouter from './routes/task.route.js';
import adminRouter from './routes/admin.route.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/admin', adminRouter);

// Global error handler — must be AFTER all routes
app.use(errorHandler);

export default app;
