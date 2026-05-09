const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Dữ liệu đã tồn tại' });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi server'
  });
};

module.exports = errorHandler;