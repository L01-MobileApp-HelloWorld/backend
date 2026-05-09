// ==========================================
// Constants cho ứng dụng "Bận hay Lười?"
// ==========================================

// 6 trạng thái người dùng
const STATES = {
  EXHAUSTED: 'exhausted',
  TIRED: 'tired',
  LAZY_WITH_DEADLINE: 'lazy_with_deadline',
  READY: 'ready',
  FOCUSED: 'focused',
  UNMOTIVATED: 'unmotivated',
};

// Chi tiết hiển thị cho từng trạng thái
const STATE_DETAILS = {
  [STATES.EXHAUSTED]: {
    name: 'Kiệt sức',
    emoji: '😫',
    color: '#EF476F',
    displayName: 'Kiệt sức hoàn toàn',
    severity: 'critical',
  },
  [STATES.TIRED]: {
    name: 'Mệt mỏi',
    emoji: '😴',
    color: '#F78C6B',
    displayName: 'Mệt mỏi nhẹ',
    severity: 'moderate',
  },
  [STATES.LAZY_WITH_DEADLINE]: {
    name: 'Lười có deadline',
    emoji: '😰',
    color: '#FFD166',
    displayName: 'Trì hoãn khẩn cấp',
    severity: 'warning',
  },
  [STATES.READY]: {
    name: 'Sẵn sàng',
    emoji: '✅',
    color: '#06D6A0',
    displayName: 'Tỉnh táo, sẵn sàng',
    severity: 'good',
  },
  [STATES.FOCUSED]: {
    name: 'Tập trung',
    emoji: '🧠',
    color: '#118AB2',
    displayName: 'Tập trung cao độ',
    severity: 'excellent',
  },
  [STATES.UNMOTIVATED]: {
    name: 'Mất động lực',
    emoji: '😞',
    color: '#9B5DE5',
    displayName: 'Thiếu động lực',
    severity: 'moderate',
  },
};

// 4 nhóm câu hỏi
const QUESTION_GROUPS = {
  ENERGY: 'energy',
  WORK: 'work',
  PSYCHOLOGY: 'psychology',
  ENVIRONMENT: 'environment',
};

const GROUP_DETAILS = {
  [QUESTION_GROUPS.ENERGY]: {
    icon: '⚡',
    label: 'Năng lượng & Sức khỏe',
    color: '#FFD166',
    weight: 0.35,
  },
  [QUESTION_GROUPS.WORK]: {
    icon: '📋',
    label: 'Công việc & Deadline',
    color: '#F78C6B',
    weight: 0.30,
  },
  [QUESTION_GROUPS.PSYCHOLOGY]: {
    icon: '💭',
    label: 'Tâm lý & Cảm xúc',
    color: '#9B5DE5',
    weight: 0.20,
  },
  [QUESTION_GROUPS.ENVIRONMENT]: {
    icon: '🌍',
    label: 'Môi trường xung quanh',
    color: '#06D6A0',
    weight: 0.15,
  },
};


// Feedback
const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
  OTHER: 'other',
};

const FEEDBACK_SEVERITY = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  SUGGESTION: 'suggestion',
};

const FEEDBACK_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Rate limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 phút
  MAX_REQUESTS: 100,
};

// JWT
const JWT = {
  EXPIRES_IN: '30d',
  ALGORITHM: 'HS256',
};

module.exports = {
  STATES,
  STATE_DETAILS,
  QUESTION_GROUPS,
  GROUP_DETAILS,
  FEEDBACK_TYPES,
  FEEDBACK_SEVERITY,
  FEEDBACK_STATUS,
  PAGINATION,
  RATE_LIMIT,
  JWT,
};