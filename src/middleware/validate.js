const { validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả validation từ express-validator
 * Nếu có lỗi → trả về 400 với danh sách lỗi
 * Nếu không có lỗi → next()
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format lỗi cho dễ đọc
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: formattedErrors,
    });
  }

  next();
};

/**
 * Middleware validate riêng cho quiz answers
 * (Không dùng express-validator, tự check logic)
 */
const validateQuizAnswers = (req, res, next) => {
  const { answers } = req.body;

  // Check tồn tại
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: 'Answers phải là một mảng',
    });
  }

  // Check số lượng
  if (answers.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'Phải có đúng 10 câu trả lời',
    });
  }

  // Check từng answer
  const validGroups = ['energy', 'work', 'psychology', 'environment'];
  const errors = [];

  answers.forEach((answer, index) => {
    if (!answer.questionId || answer.questionId < 1 || answer.questionId > 10) {
      errors.push(`Câu ${index + 1}: questionId không hợp lệ`);
    }
    if (!validGroups.includes(answer.group)) {
      errors.push(`Câu ${index + 1}: group không hợp lệ`);
    }
    if (typeof answer.selectedOption !== 'number' || answer.selectedOption < 0 || answer.selectedOption > 4) {
      errors.push(`Câu ${index + 1}: selectedOption phải từ 0-4`);
    }
    if (!answer.score || answer.score < 1 || answer.score > 5) {
      errors.push(`Câu ${index + 1}: score phải từ 1-5`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu câu trả lời không hợp lệ',
      errors,
    });
  }

  next();
};

/**
 * Middleware validate ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `ID không hợp lệ: ${id}`,
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateQuizAnswers,
  validateObjectId,
};