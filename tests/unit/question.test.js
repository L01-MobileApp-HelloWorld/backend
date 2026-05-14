process.env.JWT_SECRET = 'test-secret-key-for-jest-2024';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Question = require('../../src/models/Question');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const user = await User.create({ username: 'test', email: 'test@test.com', password: '123456' });
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Question.deleteMany({});
});

describe('GET /api/questions', () => {
  it('should return empty array when no questions', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions).toEqual([]);
    expect(res.body.data.total).toBe(0);
  });

  it('should return questions after seed', async () => {
    await request(app)
      .post('/api/questions/seed')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBe(10);
    expect(res.body.data.groups).toContain('energy');
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/questions/seed', () => {
  it('should seed 10 questions', async () => {
    const res = await request(app)
      .post('/api/questions/seed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body.data.total).toBe(10);

    const count = await Question.countDocuments();
    expect(count).toBe(10);
  });
});