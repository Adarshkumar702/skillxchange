import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { globalErrorHandler } from './middleware/errorHandler';
import { ENV } from './config/env';

const app = express();

// Security Middlewares with Robust CORS Header Reflection for Vercel Clients
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Reflect the exact incoming origin string back to the browser for credentials/authorization
      callback(null, origin || true);
    },
    credentials: true,
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Friendly Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SkillXchange Backend API Server',
    version: '1.0.0',
    status: 'running',
    message: 'Backend API is running. Access the Web Frontend at http://localhost:3000',
    webAppUrl: 'http://localhost:3000',
    docsUrl: 'http://localhost:5000/api/docs',
    healthUrl: 'http://localhost:5000/health',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), env: ENV.NODE_ENV });
});

// Primary API Router
app.use('/api', routes);

// Centralized Error Handler
app.use(globalErrorHandler);

export default app;
