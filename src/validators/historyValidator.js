const { body, query, param } = require('express-validator');

/**
 * Validation rules cho submit quiz
 */
const submitQuizRules = [
  body('answers')
    .isArray({ min: 10, max: 10 }).withMessage('Phải có đúng 10 câu trả lời'),

  body('answers.*.questionId')
    .isInt({ min: 1, max: 10 }).withMessage('questionId phải từ 1-10'),

  body('answers.*.group')
    .isIn(['energy', 'work', 'psychology', 'environment'])
    .withMessage('Nhóm câu hỏi không hợp lệ'),

  body('answers.*.selectedOption')
    .isInt({ min: 0, max: 4 }).withMessage('Lựa chọn phải từ 0-4'),

  body('answers.*.score')
    .isInt({ min: 1, max: 5 }).withMessage('Điểm phải từ 1-5'),

  body('meta.completionTime')
    .optional()
    .isInt({ min: 0 }).withMessage('Thời gian hoàn thành không hợp lệ'),

  body('meta.deviceInfo')
    .optional()
    .isString().withMessage('Device info phải là chuỗi'),
];

/**
 * Validation rules cho query params của get history
 */
const getHistoryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page phải >= 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100')
    .toInt(),

  query('state')
    .optional()
    .isIn([
      'exhausted',
      'tired',
      'lazy_with_deadline',
      'ready',
      'focused',
      'unmotivated',
    ]).withMessage('Trạng thái không hợp lệ'),

  query('sort')
    .optional()
    .matches(/^createdAt:(asc|desc)$/).withMessage('Sort phải có dạng createdAt:asc hoặc createdAt:desc'),

  query('startDate')
    .optional()
    .isISO8601().withMessage('Ngày bắt đầu không đúng định dạng'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('Ngày kết thúc không đúng định dạng'),
];

/**
 * Validation rules cho param id
 */
const historyIdRules = [
  param('id')
    .isMongoId().withMessage('ID không hợp lệ'),
];

module.exports = {
  submitQuizRules,
  getHistoryRules,
  historyIdRules,
};
