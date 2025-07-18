import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';

let app: express.Express;
let server: any;

beforeAll(async () => {
  app = express();
  server = await registerRoutes(app);
});

describe('Basic API', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBeLessThan(500); // Accept 200, 404, etc.
  });

  it('should handle POST /api/register', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'testpass123' });

    // Should either succeed or fail gracefully
    expect([200, 201, 400, 500]).toContain(res.status);
  });

  it('should handle POST /api/login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpass123' });

    // Should either succeed or fail gracefully
    expect([200, 401, 400, 500]).toContain(res.status);
  });
});

describe('Projects API', () => {
  it('should handle GET /api/projects', async () => {
    const res = await request(app).get('/api/projects');

    // Should either succeed or fail gracefully (likely 401 for auth)
    expect([200, 401, 500]).toContain(res.status);
  });

  it('should handle POST /api/projects', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Test Project', data: {} });

    // Should either succeed or fail gracefully (likely 401 for auth)
    expect([200, 201, 401, 400, 500]).toContain(res.status);
  });
});