const { body } = require('express-validator');

/**
 * Validation rules cho register
 */
const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username không được để trống')
    .isLength({ min: 3, max: 30 }).withMessage('Username phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username chỉ được chứa chữ, số và dấu gạch dưới'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .matches(/[0-9]/).withMessage('Mật khẩu phải chứa ít nhất 1 số'),

  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Tên hiển thị tối đa 50 ký tự'),
];

/**
 * Validation rules cho login
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống'),
];

/**
 * Validation rules cho update profile
 */
const updateProfileRules = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Tên hiển thị tối đa 50 ký tự'),

  body('preferences')
    .optional()
    .isObject().withMessage('Preferences phải là object'),

  body('preferences.darkMode')
    .optional()
    .isBoolean().withMessage('Dark mode phải là boolean'),

  body('preferences.language')
    .optional()
    .isIn(['vi', 'en']).withMessage('Ngôn ngữ không hợp lệ'),

  body('preferences.notificationsEnabled')
    .optional()
    .isBoolean().withMessage('Notifications enabled phải là boolean'),

  body('preferences.reminderTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Reminder time phải theo định dạng HH:mm'),

  body('preferences.reminderFrequency')
    .optional()
    .isIn(['daily', 'twice', 'custom']).withMessage('Reminder frequency không hợp lệ'),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
};
