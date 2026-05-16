# Bận Hay Lười? — Backend API

![Version](https://img.shields.io/badge/version-2.0.0-purple)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![MongoDB](https://img.shields.io/badge/mongodb-8.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Coverage](https://img.shields.io/badge/coverage-82.57%25-brightgreen)

Backend REST API cho ứng dụng mobile **“Bận hay Lười?”** — giúp người dùng phân biệt giữa **kiệt sức thật sự** và **sự trì hoãn/lười biếng** thông qua bài quiz khoa học gồm 10 câu hỏi.

---

# 📱 Overview

## Core Features

### Authentication
- Đăng ký / Đăng nhập bằng JWT  
- Hash mật khẩu với bcrypt  

### Smart Quiz Engine
Quiz 10 câu hỏi giúp phân loại 6 trạng thái năng lượng:
- Kiệt sức  
- Mệt mỏi  
- Thiếu động lực  
- Bình thường  
- Năng lượng tốt  
- Tập trung cao  

### History Tracking
- Lưu lịch sử các lần làm quiz  
- Xem lại kết quả chi tiết  

### User Feedback
- Gửi phản hồi và báo lỗi từ người dùng  

---

# System Architecture

```
Mobile App (React Native)
        │
        ▼
Express REST API (Node.js)
        │
        ▼
MongoDB Atlas (Cloud Database)
```

---

# Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Backend framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Jest + Supertest | Testing |
| Swagger | API Documentation |
| Railway | Deployment |

---

# Project Structure

```
backend/
│
├── src/
│   ├── config/        # Database & Swagger config
│   ├── controllers/   # Request/Response handlers
│   ├── middleware/    # Auth, validation, error handling
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── services/      # Business logic (quiz scoring)
│   ├── utils/         # Helpers & constants
│   └── validators/    # Input validation
│
├── tests/unit/        # Unit tests (Jest)
├── .env.example       # Environment variables template
├── jest.config.js
├── railway.json
└── swagger.yaml
```

---

# Getting Started

## Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (hoặc MongoDB local)

---

# Installation

## 1. Clone repository

```bash
git clone https://github.com/L01-MobileApp-HelloWorld/backend.git
cd backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Setup environment variables

```bash
cp .env.example .env
```

Cập nhật file `.env`:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ban_hay_luoi
JWT_SECRET=your_secret_key
PORT=3000
```

---

# ▶️ Run Application

## Development mode

```bash
npm run dev
```

Server chạy tại:
```
http://localhost:3000
```

Swagger Docs:
```
http://localhost:3000/api-docs
```

---

# Run Tests

```bash
npm test
```

Sau khi chạy test sẽ hiển thị coverage report.

**Testing stack**
- Framework: Jest + Supertest  
- Database test: MongoMemoryServer  
- Coverage:
  - 82.57% Statements
  - 71.96% Branches
- Test cases: 32 tests / 4 test suites

---

# API Endpoints

## Auth

- **POST /api/auth/register**
  - Auth: ❌ Không cần đăng nhập
  - Description: Đăng ký tài khoản mới

- **POST /api/auth/login**
  - Auth: ❌ Không cần đăng nhập
  - Description: Đăng nhập hệ thống

- **GET /api/auth/profile**
  - Auth: ✅ Yêu cầu JWT
  - Description: Lấy thông tin người dùng hiện tại

---

## Question

- **GET /api/questions**
  - Auth: ✅ Yêu cầu JWT
  - Description: Lấy danh sách 10 câu hỏi

  
- **POST /api/questions/seed**
  - Auth: ✅ Yêu cầu JWT
  - Description: Khởi tạo câu hỏi mẫu


## Quiz & History

- **POST /api/history/submit**
  - Auth: ✅ Yêu cầu JWT
  - Description: Nộp bài quiz (10 câu hỏi)

- **GET /api/history**
  - Auth: ✅ Yêu cầu JWT
  - Description: Lấy danh sách lịch sử làm quiz

- **GET /api/history/:id**
  - Auth: ✅ Yêu cầu JWT
  - Description: Lấy chi tiết một lần làm quiz

- **DELETE /api/history/:id**
  - Auth: ✅ Yêu cầu JWT
  - Description: Xóa một bản ghi lịch sử

---

## Feedback

- **POST /api/feedback**
  - Auth: ✅ Yêu cầu JWT
  - Description: Gửi phản hồi hoặc báo lỗi

- **GET /api/feedback/stats**
  - Auth: ✅ Yêu cầu JWT
  - Description: Lấy thống kê feedback

# Deployment (Railway)

Deploy tự động qua GitHub:

1. Push code lên GitHub  
2. Vào Railway → New Project → Deploy from GitHub  
3. Chọn repository  
4. Thêm Environment Variables trên Railway dashboard  
5. Mỗi lần push → tự động deploy  

Link deploy trên railway : https://backend-production-28f1.up.railway.app/'
---

# CI/CD Pipeline

- Platform: Railway
- Auto deploy khi push branch chính
- Health check: `GET /`
- Rollback tự động nếu deploy fail

---

# API Documentation

Swagger UI:
```
http://localhost:3000/api-docs
```

Hoặc xem file:
```
swagger.yaml
```

---

# Security

- Hash mật khẩu bằng bcrypt (12 rounds)
- JWT expiration: 30 ngày
- Rate limit: 100 requests / 15 phút
- Helmet bảo vệ HTTP headers
- Input validation với express-validator

---

# Authors

Backend Developer: **Nguyễn Ngọc Thiện**  
Frontend Developer: **Nguyễn Huy**  

Project: Assignment 3 — Mobile Application Development

---

# License

MIT License — xem file `LICENSE` để biết thêm chi tiết.

© 2026 Bận Hay Lười? — All Rights Reserved