# Bận hay Lười? - Backend API

![Version](https://img.shields.io/badge/version-2.0.0-purple)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![MongoDB](https://img.shields.io/badge/mongodb-8.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Coverage](https://img.shields.io/badge/coverage-82.57%25-brightgreen)

## 📱 Giới Thiệu

Backend API cho ứng dụng di động **"Bận hay Lười?"** - ứng dụng giúp người dùng phân biệt giữa kiệt sức thật sự và lười biếng thông qua bài quiz 10 câu hỏi.

### Tính Năng Chính

- **Xác thực người dùng**: Đăng ký, đăng nhập với JWT
- **Quiz thông minh**: 10 câu hỏi, phân loại 6 trạng thái (Kiệt sức → Tập trung cao)
- **Lịch sử**: Xem lại kết quả các lần kiểm tra trước
- **Feedback**: Gửi phản hồi, báo lỗi từ người dùng

### Kiến Trúc

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Mobile App      │────>│ Express API     │────>│ MongoDB Atlas   │
│ (React Native)  │     │ (Node.js)       │     │ (Cloud)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘


### Công Nghệ Sử Dụng

| Công Nghệ              | Mục Đích            |
|------------------------|---------------------|
| **Node.js + Express**  | Backend framework   |
| **MongoDB + Mongoose** | Database & ODM      |
| **JWT (jsonwebtoken)** | Xác thực người dùng |
| **bcryptjs**           | Mã hóa mật khẩu     |
| **Jest + Supertest**   | Unit testing        |
| **Swagger**            | API Documentation   |
| **Railway**            | Deployment          |

### Cấu Trúc Thư Mục
backend/
├── src/
│ ├── config/ # Cấu hình database, swagger
│ ├── controllers/ # Xử lý logic request/response
│ ├── middleware/ # Auth, validation, error handling
│ ├── models/ # MongoDB schemas (User, History, Feedback)
│ ├── routes/ # Định tuyến API endpoints
│ ├── services/ # Business logic (quiz scoring)
│ ├── utils/ # Constants, helpers
│ └── validators/ # Validation rules
├── tests/
│ └── unit/ # Unit tests (Jest)
├── .env.example # Mẫu biến môi trường
├── jest.config.js # Cấu hình testing
├── railway.json # Cấu hình deploy Railway
└── swagger.yaml # API documentation


## Cài Đặt & Chạy

### Yêu Cầu

- Node.js >= 18.0.0
- MongoDB Atlas account (free) hoặc MongoDB local

### Cài Đặt

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/ban-hay-luoi-backend.git
cd ban-hay-luoi-backend
```

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env từ mẫu
cp .env.example .env

# 4. Chỉnh sửa .env với thông tin của bạn
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ban_hay_luoi
# JWT_SECRET=your_secret_key


# Chạy Development
```bash
npm run dev
# Server chạy tại: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```
# Chạy Tests
```bash
npm test
# Coverage report sẽ hiển thị sau khi test xong
```

# API Endpoints
```bash
Auth
Method	Endpoint	Auth	Mô tả
POST	/api/auth/register	❌	Đăng ký tài khoản
POST	/api/auth/login	❌	Đăng nhập
GET	/api/auth/profile	✅	Xem thông tin cá nhân
Quiz & History
Method	Endpoint	Auth	Mô tả
POST	/api/history/submit	✅	Nộp bài quiz (10 câu)
GET	/api/history	✅	Xem lịch sử kiểm tra
GET	/api/history/:id	✅	Xem chi tiết 1 lần kiểm tra
DELETE	/api/history/:id	✅	Xóa lịch sử
Feedback
Method	Endpoint	Auth	Mô tả
POST	/api/feedback	✅	Gửi phản hồi/báo lỗi
GET	/api/feedback/stats	✅	Xem thống kê feedback
```

# Testing

Framework: Jest + Supertest

Database test: MongoMemoryServer (MongoDB ảo trong RAM)

Coverage: 82.57% Statements, 71.96% Branches

Test cases: 32 tests, 4 test suites

# Deployment (Railway)
Deploy tự động qua GitHub:
Push code lên GitHub

Vào Railway → New Project → Deploy from GitHub

Chọn repository → Railway tự build & deploy

Thêm environment variables trong dashboard Railway

Backend tự động deploy mỗi khi push code mới

# CI/CD Pipeline:
Platform: Railway (tự động deploy khi push lên branch chính)

Health check: GET / endpoint

Rollback: Tự động nếu deploy fail

# API Documentation
Swagger UI có sẵn tại: http://localhost:3000/api-docs

Hoặc xem file swagger.yaml trong thư mục gốc.

# Bảo Mật
Mật khẩu được hash bằng bcrypt (12 rounds)

JWT token hết hạn sau 30 ngày

Rate limiting: 100 requests/15 phút

Helmet.js bảo vệ HTTP headers

Input validation với express-validator

# Tác Giả
Backend Developer: Nguyễn Ngọc Thiện

Frontend Developer: Nguyễn Huy

Project: Assignment 3 - Mobile Application Development

License
MIT License - Xem file LICENSE để biết thêm chi tiết.

© 2026 Bận hay Lười? - All Rights Reserved











































<!-- 2.1 Tạo thư mục dự án

# Mở Terminal (Mac/Linux) hoặc Command Prompt (Windows)
cd Desktop  # hoặc thư mục bạn muốn
mkdir ban-hay-luoi-backend
cd ban-hay-luoi-backend

2.2 Khởi tạo project và cài dependencies

# Khởi tạo npm project
npm init -y

# Cài đặt tất cả dependencies
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv express-rate-limit express-validator swagger-ui-express yamljs

# Cài dev dependencies
npm install --save-dev jest nodemon supertest mongodb-memory-server eslint

2.3 Tạo cấu trúc thư mục

# Tạo tất cả thư mục cần thiết
mkdir -p src/{config,controllers,middleware,models,routes,services,utils,validators}
mkdir -p tests/{unit,integration} -->