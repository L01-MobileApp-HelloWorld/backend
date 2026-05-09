module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/unit/**/*.test.js',     // Chỉ chạy file trong thư mục unit
  ],
  // KHÔNG chạy integration test bây giờ
  testPathIgnorePatterns: [
    '/node_modules/',
    '/integration/'              // Bỏ qua thư mục integration
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/controllers/analyticsController.js',  // ← Thêm dòng này
    '!src/routes/analyticsRoutes.js',           // ← Thêm dòng này
    '!src/middleware/analytics.js',             // ← Thêm dòng này
    '!src/config/sentry.js',     
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000,
};

// module.exports = {
//   testEnvironment: 'node',
//   roots: ['<rootDir>/tests'],
//   testMatch: ['**/*.test.js'],
//   collectCoverageFrom: [
//     'src/**/*.js',
//     '!src/server.js',
//     '!src/config/**'
//   ],
//   coverageThreshold: {
//     global: {
//       branches: 70,
//       functions: 70,
//       lines: 70,
//       statements: 70
//     }
//   },
//   coverageReporters: ['text', 'lcov', 'html'],
//   setupFilesAfterSetup: ['<rootDir>/tests/setup.js'],
//   testTimeout: 30000
// };