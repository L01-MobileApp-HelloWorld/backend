process.env.JWT_SECRET = 'test-secret-key-for-jest-2024';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const History = require('../../src/models/History');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  // Khởi tạo MongoDB ảo
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Tạo user test và token
  const user = await User.create({
    username: 'historytest',
    email: 'history@test.com',
    password: '123456'
  });
  userId = user._id;
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await History.deleteMany({});
});

describe('POST /api/histories/submit', () => {
  const validAnswers = [
    { questionId: 1, group: 'energy', selectedOption: 2, score: 4 },
    { questionId: 2, group: 'energy', selectedOption: 1, score: 2 },
    { questionId: 3, group: 'energy', selectedOption: 3, score: 5 },
    { questionId: 4, group: 'work', selectedOption: 2, score: 3 },
    { questionId: 5, group: 'work', selectedOption: 3, score: 4 },
    { questionId: 6, group: 'psychology', selectedOption: 1, score: 2 },
    { questionId: 7, group: 'psychology', selectedOption: 2, score: 3 },
    { questionId: 8, group: 'environment', selectedOption: 3, score: 4 },
    { questionId: 9, group: 'environment', selectedOption: 2, score: 3 },
    { questionId: 10, group: 'energy', selectedOption: 4, score: 5 }
  ];

  it('should submit quiz and return results', async () => {
    const res = await request(app)
      .post('/api/histories/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: validAnswers });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.history).toHaveProperty('state');
    expect(res.body.data.history).toHaveProperty('scores');
    expect(res.body.data.history.scores).toHaveProperty('total');
  });

  it('should reject incomplete answers', async () => {
    const res = await request(app)
      .post('/api/histories/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [{ questionId: 1, group: 'energy', score: 3 }] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/api/histories/submit')
      .send({ answers: validAnswers });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/histories', () => {
  beforeEach(async () => {
    await History.create([
      {
        userId,
        answers: [],
        scores: { energy: 50, work: 60, psychology: 45, environment: 55, total: 52 },
        state: 'ready',
        stateDetails: { name: 'Sẵn sàng', emoji: '✅', color: '#06D6A0' },
        createdAt: new Date('2024-01-02T10:00:00.000Z')
      },
      {
        userId,
        answers: [],
        scores: { energy: 20, work: 30, psychology: 15, environment: 25, total: 22 },
        state: 'exhausted',
        stateDetails: { name: 'Kiệt sức', emoji: '😫', color: '#EF476F' },
        createdAt: new Date('2024-01-03T10:00:00.000Z')
      }
    ]);
  });

  it('should return user history', async () => {
    const res = await request(app)
      .get('/api/histories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.histories)).toBe(true);
    expect(res.body.data.histories).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.histories[0].state).toBe('exhausted');
    expect(new Date(res.body.data.histories[0].createdAt).getTime()).toBeGreaterThan(
      new Date(res.body.data.histories[1].createdAt).getTime()
    );
  });

  it('should filter by state', async () => {
    const res = await request(app)
      .get('/api/histories?state=exhausted')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.histories)).toBe(true);
    expect(res.body.data.histories).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
    res.body.data.histories.forEach((history) => {
      expect(history.state).toBe('exhausted');
    });
  });

  it('should sort histories by createdAt ascending when sort=createdAt:asc', async () => {
    const res = await request(app)
      .get('/api/histories?sort=createdAt:asc')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.histories)).toBe(true);
    expect(res.body.data.histories).toHaveLength(2);
    expect(res.body.data.histories[0].state).toBe('ready');
    expect(new Date(res.body.data.histories[0].createdAt).getTime()).toBeLessThan(
      new Date(res.body.data.histories[1].createdAt).getTime()
    );
  });

  it('should reject invalid sort value', async () => {
    const res = await request(app)
      .get('/api/histories?sort=latest')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject unsupported sort field', async () => {
    const res = await request(app)
      .get('/api/histories?sort=state:asc')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/histories/:id', () => {
  it('should delete specific history entry', async () => {
    const entry = await History.create({
      userId,
      answers: [],
      scores: { energy: 50, work: 60, psychology: 45, environment: 55, total: 52 },
      state: 'ready',
      stateDetails: { name: 'Sẵn sàng', emoji: '✅' }
    });

    const res = await request(app)
      .delete(`/api/histories/${entry._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Kiểm tra đã xóa thật
    const deleted = await History.findById(entry._id);
    expect(deleted).toBeNull();
  });

  it('should return 404 for non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/histories/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});






































// const mongoose = require('mongoose');
// const request = require('supertest');
// const app = require('../../src/app');
// const User = require('../../src/models/User');
// const History = require('../../src/models/History');
// const jwt = require('jsonwebtoken');

// describe('History API', () => {
//   let token;
//   let userId;

//   beforeAll(async () => {
//     const user = await User.create({
//       username: 'testhistory',
//       email: 'testhistory@example.com',
//       password: 'password123'
//     });
//     userId = user._id;
//     token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');
//   });

//   beforeEach(async () => {
//     await History.deleteMany({ userId });
//   });

//   describe('POST /api/history/submit', () => {
//     it('should submit quiz and return results', async () => {
//       const answers = [
//         { questionId: 1, group: 'energy', selectedOption: 2, score: 4 },
//         { questionId: 2, group: 'energy', selectedOption: 1, score: 2 },
//         { questionId: 3, group: 'energy', selectedOption: 3, score: 5 },
//         { questionId: 4, group: 'work', selectedOption: 2, score: 3 },
//         { questionId: 5, group: 'work', selectedOption: 3, score: 4 },
//         { questionId: 6, group: 'psychology', selectedOption: 1, score: 2 },
//         { questionId: 7, group: 'psychology', selectedOption: 2, score: 3 },
//         { questionId: 8, group: 'environment', selectedOption: 3, score: 4 },
//         { questionId: 9, group: 'environment', selectedOption: 2, score: 3 },
//         { questionId: 10, group: 'energy', selectedOption: 4, score: 5 }
//       ];

//       const response = await request(app)
//         .post('/api/history/submit')
//         .set('Authorization', `Bearer ${token}`)
//         .send({ answers });

//       expect(response.status).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.history).toHaveProperty('state');
//       expect(response.body.data.history).toHaveProperty('scores');
//       expect(response.body.data.history).toHaveProperty('stateDetails');
//     });

//     it('should reject incomplete answers', async () => {
//       const response = await request(app)
//         .post('/api/history/submit')
//         .set('Authorization', `Bearer ${token}`)
//         .send({ answers: [
//           { questionId: 1, group: 'energy', selectedOption: 2, score: 4 }
//         ]});

//       expect(response.status).toBe(400);
//     });

//     it('should require authentication', async () => {
//       const response = await request(app)
//         .post('/api/history/submit')
//         .send({ answers: [] });

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('GET /api/history', () => {
//     beforeEach(async () => {
//       await History.create([
//         {
//           userId,
//           answers: [],
//           scores: { energy: 50, work: 60, psychology: 45, environment: 55, total: 52 },
//           state: 'ready',
//           stateDetails: { name: 'Sẵn sàng', emoji: '✅' }
//         },
//         {
//           userId,
//           answers: [],
//           scores: { energy: 20, work: 30, psychology: 15, environment: 25, total: 22 },
//           state: 'exhausted',
//           stateDetails: { name: 'Kiệt sức', emoji: '😫' }
//         }
//       ]);
//     });

//     it('should return user history', async () => {
//       const response = await request(app)
//         .get('/api/history')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.histories).toBeDefined();
//       expect(Object.keys(response.body.data.histories).length).toBeGreaterThan(0);
//     });

//     it('should filter by state', async () => {
//       const response = await request(app)
//         .get('/api/history?state=exhausted')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       const allGroups = Object.values(response.body.data.histories).flat();
//       allGroups.forEach(h => {
//         expect(h.state).toBe('exhausted');
//       });
//     });
//   });

//   describe('DELETE /api/history/:id', () => {
//     it('should delete specific history entry', async () => {
//       const entry = await History.create({
//         userId,
//         answers: [],
//         scores: { energy: 50, work: 60, psychology: 45, environment: 55, total: 52 },
//         state: 'ready',
//         stateDetails: { name: 'Sẵn sàng', emoji: '✅' }
//       });

//       const response = await request(app)
//         .delete(`/api/history/${entry._id}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
      
//       const deleted = await History.findById(entry._id);
//       expect(deleted).toBeNull();
//     });

//     it('should not delete other users history', async () => {
//       const otherUser = await User.create({
//         username: 'other',
//         email: 'other@example.com',
//         password: 'password123'
//       });

//       const entry = await History.create({
//         userId: otherUser._id,
//         answers: [],
//         scores: { energy: 50, work: 60, psychology: 45, environment: 55, total: 52 },
//         state: 'ready',
//         stateDetails: { name: 'Sẵn sàng', emoji: '✅' }
//       });

//       const response = await request(app)
//         .delete(`/api/history/${entry._id}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(404);
//     });
//   });
// });
