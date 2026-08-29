import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { globalErrorHandler } from './middleware/errorHandler';
import { ENV } from './config/env';
import { corsOptions } from './config/cors';

const app = express();

// Security Middlewares with Strict Production-Safe CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));

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
    message: 'Backend API is running.',
    webAppUrl: 'https://skillxchange-web.vercel.app',
    healthUrl: '/health',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), env: ENV.NODE_ENV });
});

// Mount Primary API Router under both /api and root / for total compatibility
app.use('/api', routes);
app.use('/', routes);

// Centralized Error Handler
app.use(globalErrorHandler);

export default app;
