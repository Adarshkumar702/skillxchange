import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const router = Router();

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SkillXchange API Documentation',
    version: '1.0.0',
    description: 'Production-ready REST API documentation for SkillXchange platform.',
  },
  servers: [{ url: 'http://localhost:5000/api', description: 'Local Development Server' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user account',
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user & receive tokens',
        responses: { 200: { description: 'Authenticated' } },
      },
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        responses: { 200: { description: 'User Profile' } },
      },
    },
    '/matches/recommended': {
      get: {
        tags: ['Matching'],
        summary: 'Get AI/Algorithm recommended peer matches',
        responses: { 200: { description: 'Peer recommendations list' } },
      },
    },
    '/swaps': {
      post: {
        tags: ['Swaps'],
        summary: 'Create skill swap request',
        responses: { 201: { description: 'Swap created' } },
      },
      get: {
        tags: ['Swaps'],
        summary: 'Get user swap requests',
        responses: { 200: { description: 'Swaps list' } },
      },
    },
    '/placement/readiness': {
      get: {
        tags: ['Placement'],
        summary: 'Get user placement readiness breakdown',
        responses: { 200: { description: 'Readiness data' } },
      },
    },
    '/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Get platform analytics overview (Admin only)',
        responses: { 200: { description: 'Platform metrics' } },
      },
    },
  },
};

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
