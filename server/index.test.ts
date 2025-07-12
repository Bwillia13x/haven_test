import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';

let app: express.Express;

beforeAll(async () => {
  app = express();
  await registerRoutes(app);
});

describe('API', () => {
  it('should respond to GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBeLessThan(500); // Accept 200, 404, etc.
  });
}); 