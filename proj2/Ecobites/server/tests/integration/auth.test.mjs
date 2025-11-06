import request from 'supertest';
import app from '../../src/app.js'; // your Express app
import { connectDB, closeDB, clearDB } from '../../src/setupTests.js';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Yash',
        email: 'test@example.com',
        password: '123456',
      });

    expect(res.statusCode).toBe(201);
    // Token is now in httpOnly cookie, not response body
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/token=/);
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body).not.toHaveProperty('token'); // Should not expose token in body
  });

  it('should not register user with existing email', async () => {
    // First registration
    await request(app).post('/api/auth/register').send({
      name: 'Yash',
      email: 'test@example.com',
      password: '123456',
    });

    // Second registration with same email
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another',
      email: 'test@example.com',
      password: 'abcdef',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });
});
