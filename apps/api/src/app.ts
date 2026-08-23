import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { globalErrorHandler } from './middleware/errorHandler';
import { ENV } from './config/env';

const app = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), env: ENV.NODE_ENV });
});

// Primary API Router
app.use('/api', routes);

// Centralized Error Handler
app.use(globalErrorHandler);

export default app;
