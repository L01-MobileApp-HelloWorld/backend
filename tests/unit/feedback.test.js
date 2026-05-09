process.env.JWT_SECRET = 'test-secret-key-for-jest-2024';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Feedback = require('../../src/models/Feedback');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user = await User.create({
    username: 'feedbacktest',
    email: 'feedback@test.com',
    password: '123456'
  });
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Feedback.deleteMany({});
});

describe('POST /api/feedback', () => {
  it('should submit feedback successfully', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'bug',
        severity: 'major',
        title: 'Test bug report',
        description: 'This is a test bug description for the feedback API'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.feedback).toBeDefined();
    expect(res.body.data.feedback.type).toBe('bug');
  });

  it('should submit feature request', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'feature',
        title: 'New feature request',
        description: 'I want a dark mode button'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.feedback.type).toBe('feature');
  });

  it('should reject without authentication', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        type: 'bug',
        title: 'Test',
        description: 'Test description'
      });

    expect(res.status).toBe(401);
  });

  it('should reject missing required fields', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'bug' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/feedback/stats', () => {
  it('should return feedback statistics', async () => {
    // Tạo vài feedback trước
    await Feedback.create([
      { userId: new mongoose.Types.ObjectId(), type: 'bug', severity: 'critical', title: 'Bug 1', description: 'Test 1' },
      { userId: new mongoose.Types.ObjectId(), type: 'feature', severity: 'suggestion', title: 'Feature 1', description: 'Test 2' },
      { userId: new mongoose.Types.ObjectId(), type: 'improvement', severity: 'minor', title: 'Improvement 1', description: 'Test 3' }
    ]);

    const res = await request(app)
      .get('/api/feedback/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.stats.length).toBeGreaterThan(0);
  });

  it('should return zero stats when no feedback', async () => {
    const res = await request(app)
      .get('/api/feedback/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(0);
  });
});