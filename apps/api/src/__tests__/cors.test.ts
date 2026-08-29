import request from 'supertest';
import app from '../app';
import { getAllowedOrigins, isOriginAllowed } from '../config/cors';

describe('Production-Safe CORS Configuration', () => {
  describe('Origin Parsing & Validation Utility', () => {
    it('should include localhost:3000 and production origins in allowed list', () => {
      const allowed = getAllowedOrigins();
      expect(allowed).toContain('http://localhost:3000');
      expect(allowed).toContain('http://127.0.0.1:3000');
      expect(allowed).toContain('https://skillxchange-web.vercel.app');
    });

    it('should allow valid origins and allow requests with no origin', () => {
      expect(isOriginAllowed(undefined)).toBe(true);
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('https://skillxchange-web.vercel.app')).toBe(true);
    });

    it('should reject untrusted malicious origins', () => {
      expect(isOriginAllowed('https://malicious-attacker.com')).toBe(false);
      expect(isOriginAllowed('http://evil-site.net')).toBe(false);
    });
  });

  describe('Express HTTP API CORS Headers Integration', () => {
    it('should grant CORS access to allowed origin http://localhost:3000 with credentials', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should grant CORS access to allowed production origin https://skillxchange-web.vercel.app', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://skillxchange-web.vercel.app');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://skillxchange-web.vercel.app');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should REJECT unauthorized origin https://malicious-attacker.com and NOT reflect it', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://malicious-attacker.com');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should correctly respond to preflight OPTIONS requests from allowed origins', async () => {
      const res = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization');

      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });

    it('should allow requests without an Origin header (e.g. server-to-server or curl)', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });
});
