process.env.JWT_SECRET = 'test-secret-key-for-integration';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 'test@test.com', password: '123456' });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    await User.create({ username: 'user1', email: 'test@test.com', password: '123456' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'user2', email: 'test@test.com', password: '123456' });
    
    expect(res.status).toBe(409);
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test' });
    
    expect(res.status).toBe(400);
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 'test@test.com', password: '123' });
    
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({ username: 'test', email: 'test@test.com', password: '123456' });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });
    
    expect(res.status).toBe(401);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no@user.com', password: '123456' });
    
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('should return user profile with valid token', async () => {
    const user = await User.create({ username: 'test', email: 'test@test.com', password: '123456' });
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('test@test.com');
  });

  it('should reject without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should issue a new access token and refresh token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'refreshuser', email: 'refresh@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: registerRes.body.data.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(registerRes.body.data.refreshToken);
  });

  it('should reject an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-refresh-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/logout', () => {
  it('should revoke the refresh token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'logoutuser', email: 'logout@test.com', password: '123456' });

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: registerRes.body.data.refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: registerRes.body.data.refreshToken });

    expect(refreshRes.status).toBe(401);
    expect(refreshRes.body.success).toBe(false);
  });
});
