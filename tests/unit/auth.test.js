// Đặt JWT_SECRET TRƯỚC KHI import app
process.env.JWT_SECRET = 'test-secret-key-for-jest-2024';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup MongoDB ảo
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Cleanup
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Xóa dữ liệu sau mỗi test
afterEach(async () => {
  await User.deleteMany({});
});

// ============ TEST CASES ============

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('testuser');
  });

  it('should reject duplicate email', async () => {
    // Tạo user trước
    await User.create({
      username: 'existing',
      email: 'test@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing email and password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@test.com',
        password: '123'  // quá ngắn
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Tạo user để login
    await User.create({
      username: 'testuser',
      email: 'test@test.com',
      password: '123456'
    });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexist@test.com',
        password: '123456'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/profile', () => {
  it('should return profile with valid token', async () => {
    // Tạo user
    const user = await User.create({
      username: 'testuser',
      email: 'test@test.com',
      password: '123456'
    });

    // Tạo token thủ công
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@test.com');
  });

  it('should reject without token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid_token_xyz');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});













































// const request = require('supertest');
// const mongoose = require('mongoose');
// const app = require('../../src/app');
// const User = require('../../src/models/User');
// const { MongoMemoryServer } = require('mongodb-memory-server');

// let mongoServer;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   await mongoose.connect(mongoServer.getUri());
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// beforeEach(async () => {
//   await User.deleteMany({});
// });

// describe('POST /api/auth/register', () => {
//   it('should register a new user', async () => {
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({ username: 'test', email: 'test@test.com', password: '123456' });
    
//     expect(res.status).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.token).toBeDefined();
//   });

//   it('should reject duplicate email', async () => {
//     await User.create({ username: 'user1', email: 'test@test.com', password: '123456' });
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({ username: 'user2', email: 'test@test.com', password: '123456' });
    
//     expect(res.status).toBe(409);
//   });

//   it('should reject missing fields', async () => {
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({ username: 'test' });
    
//     expect(res.status).toBe(400);
//   });

//   it('should reject short password', async () => {
//     const res = await request(app)
//       .post('/api/auth/register')
//       .send({ username: 'test', email: 'test@test.com', password: '123' });
    
//     expect(res.status).toBe(400);
//   });
// });

// describe('POST /api/auth/login', () => {
//   beforeEach(async () => {
//     await User.create({ username: 'test', email: 'test@test.com', password: '123456' });
//   });

//   it('should login with correct credentials', async () => {
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({ email: 'test@test.com', password: '123456' });
    
//     expect(res.status).toBe(200);
//     expect(res.body.data.token).toBeDefined();
//   });

//   it('should reject wrong password', async () => {
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({ email: 'test@test.com', password: 'wrongpass' });
    
//     expect(res.status).toBe(401);
//   });

//   it('should reject non-existent user', async () => {
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({ email: 'no@user.com', password: '123456' });
    
//     expect(res.status).toBe(401);
//   });
// });

// describe('GET /api/auth/profile', () => {
//   it('should return user profile with valid token', async () => {
//     const user = await User.create({ username: 'test', email: 'test@test.com', password: '123456' });
//     const jwt = require('jsonwebtoken');
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');

//     const res = await request(app)
//       .get('/api/auth/profile')
//       .set('Authorization', `Bearer ${token}`);
    
//     expect(res.status).toBe(200);
//     expect(res.body.data.user.email).toBe('test@test.com');
//   });

//   it('should reject without token', async () => {
//     const res = await request(app).get('/api/auth/profile');
//     expect(res.status).toBe(401);
//   });
// });
