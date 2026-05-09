// ==========================================
// Helper Functions cho "Bận hay Lười?"
// ==========================================

/**
 * Format ngày giờ hiển thị cho người dùng
 * @param {Date|string} date - Ngày cần format
 * @returns {string} Chuỗi đã format
 */
const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Vừa xong (< 1 phút)
  if (diffMins < 1) return 'Vừa xong';
  
  // Vài phút trước (< 60 phút)
  if (diffMins < 60) return `${diffMins} phút trước`;
  
  // Vài giờ trước (< 24 giờ)
  if (diffHours < 24) return `${diffHours} giờ trước`;
  
  // Hôm qua
  if (diffDays === 1) return 'Hôm qua';
  
  // Vài ngày trước (< 7 ngày)
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  // Format đầy đủ
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format thời gian (giờ:phút)
 * @param {Date|string} date
 * @returns {string} VD: "14:30"
 */
const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Nhóm mảng theo ngày
 * @param {Array} items - Mảng cần nhóm
 * @param {string} dateField - Tên field chứa ngày
 * @returns {Object} Object với key là ngày
 */
const groupByDate = (items, dateField = 'createdAt') => {
  const groups = {};

  items.forEach(item => {
    const date = new Date(item[dateField]);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key;
    if (date.toDateString() === today.toDateString()) {
      key = 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Hôm qua';
    } else {
      const diffDays = Math.floor((today - date) / 86400000);
      if (diffDays < 7) {
        key = `${diffDays} ngày trước`;
      } else if (diffDays < 30) {
        key = 'Tuần trước';
      } else {
        key = 'Cũ hơn';
      }
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return groups;
};

/**
 * Tạo slug từ string
 * @param {string} str
 * @returns {string} slug
 */
const createSlug = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return regex.test(phone);
};

/**
 * Mask email để bảo vệ privacy
 * @param {string} email
 * @returns {string} Masked email
 */
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};

/**
 * Tính streak (số ngày liên tiếp)
 * @param {Array<Date>} dates - Mảng các ngày
 * @returns {number} Streak count
 */
const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) return 0;

  const sortedDates = dates
    .map(d => new Date(d).toDateString())
    .sort()
    .reverse();

  const uniqueDates = [...new Set(sortedDates)];
  
  let streak = 1;
  const today = new Date().toDateString();
  
  // Phải có hôm nay hoặc hôm qua mới tính streak
  if (uniqueDates[0] !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uniqueDates[0] !== yesterday) return 0;
  }

  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i - 1]);
    const diffDays = (previous - current) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Tạo response format chuẩn
 * @param {boolean} success
 * @param {*} data
 * @param {string} message
 * @returns {Object}
 */
const createResponse = (success, data = null, message = '') => {
  const response = { success };
  if (message) response.message = message;
  if (data) response.data = data;
  return response;
};

/**
 * Parse pagination params từ query
 * @param {Object} query - req.query
 * @returns {Object} { page, limit, skip }
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Sleep/delay helper
 * @param {number} ms - Milliseconds
 * @returns {Promise}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Random number trong khoảng
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  formatDate,
  formatTime,
  groupByDate,
  createSlug,
  isValidEmail,
  isValidPhone,
  maskEmail,
  calculateStreak,
  createResponse,
  parsePagination,
  sleep,
  randomBetween,
};