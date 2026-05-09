const History = require('../models/History');

/**
 * Middleware ghi log hành vi người dùng
 * Có thể gửi đến Google Analytics, Mixpanel, hoặc tự lưu
 */
const trackUserBehavior = async (req, res, next) => {
  // Lưu timestamp bắt đầu request
  req.startTime = Date.now();

  // Ghi đè res.json để bắt response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    // Tính thời gian xử lý
    const duration = Date.now() - req.startTime;

    // Log analytics data (trong production gửi đến service analytics)
    const analyticsData = {
      endpoint: req.originalUrl,
      method: req.method,
      userId: req.user?.id || 'anonymous',
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')?.substring(0, 100),
    };

    // Log ra console (thay bằng gửi đến Google Analytics/Amplitude trong production)
    if (process.env.NODE_ENV === 'production') {
      console.log('[ANALYTICS]', JSON.stringify(analyticsData));
      // TODO: Gửi đến Google Analytics 4 Measurement Protocol
      // await sendToGoogleAnalytics(analyticsData);
    }

    return originalJson(data);
  };

  next();
};

module.exports = { trackUserBehavior };