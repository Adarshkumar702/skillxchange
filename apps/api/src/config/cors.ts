import { CorsOptions } from 'cors';
import { ENV } from './env';

/**
 * Normalizes and returns the complete list of authorized CORS origins.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Add CLIENT_URL if defined
  if (ENV.CLIENT_URL) {
    ENV.CLIENT_URL.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (trimmed) origins.add(trimmed);
    });
  }

  // Add ALLOWED_ORIGINS if defined
  if (ENV.ALLOWED_ORIGINS) {
    ENV.ALLOWED_ORIGINS.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (trimmed) origins.add(trimmed);
    });
  }

  // Always support standard development origins in non-production
  if (ENV.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://localhost:5000');
  }

  // Ensure production Vercel frontend origin is allowed
  origins.add('https://skillxchange-web.vercel.app');

  return Array.from(origins);
}

/**
 * Validates whether a specific origin is permitted.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests without Origin header (e.g., server-to-server, mobile apps, curl, Postman)
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  const allowedOrigins = getAllowedOrigins();

  return allowedOrigins.includes(normalizedOrigin);
}

/**
 * Production-safe CORS configuration for Express middleware.
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Return false to reject origin without throwing unhandled Express exceptions
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
  optionsSuccessStatus: 200,
};

/**
 * Production-safe CORS configuration for Socket.IO server.
 */
export const socketCorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST'],
};
