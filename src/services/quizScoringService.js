const STATES = {
  EXHAUSTED: 'exhausted',
  TIRED: 'tired',
  LAZY_WITH_DEADLINE: 'lazy_with_deadline',
  READY: 'ready',
  FOCUSED: 'focused',
  UNMOTIVATED: 'unmotivated'
};

const STATE_DETAILS = {
  [STATES.EXHAUSTED]: {
    name: 'Kiệt sức',
    emoji: '😫',
    color: '#EF476F',
    description: 'Bạn thực sự đã kiệt sức, cần nghỉ ngơi ngay lập tức',
    recommendations: [
      '🛏️ Đi ngủ ngay hoặc chợp mắt ít nhất 30 phút',
      '🚫 Không cố gắng làm việc thêm - sẽ phản tác dụng',
      '💧 Uống một ly nước và ăn nhẹ nếu đói',
      '📅 Lên lịch làm việc lại vào ngày mai với năng lượng mới'
    ]
  },
  [STATES.TIRED]: {
    name: 'Mệt mỏi',
    emoji: '😴',
    color: '#F78C6B',
    description: 'Bạn đang mệt nhưng vẫn có thể làm việc nhẹ nhàng',
    recommendations: [
      '☕ Nghỉ ngơi 15-20 phút với một tách trà/cà phê',
      '📝 Chỉ làm các task đơn giản, không đòi hỏi sáng tạo',
      '🚶 Đi dạo ngắn 10 phút để lấy lại tỉnh táo',
      '⏰ Sử dụng Pomodoro 25/5 để không quá sức'
    ]
  },
  [STATES.LAZY_WITH_DEADLINE]: {
    name: 'Lười có deadline',
    emoji: '😰',
    color: '#FFD166',
    description: 'Bạn đang trì hoãn dù có deadline đang đến gần',
    recommendations: [
      '⚡ Bắt đầu ngay với 5 phút - "Just 5 minutes rule"',
      '📋 Chia nhỏ task thành các bước siêu nhỏ (2-5 phút/bước)',
      '🎯 Đặt timer 25 phút và cam kết hoàn thành 1 task nhỏ',
      '📱 Tắt điện thoại, đóng tab mạng xã hội ngay lập tức'
    ]
  },
  [STATES.READY]: {
    name: 'Sẵn sàng',
    emoji: '✅',
    color: '#06D6A0',
    description: 'Bạn đang ở trạng thái tốt để bắt đầu làm việc',
    recommendations: [
      '💪 Bắt tay vào task quan trọng nhất ngay!',
      '🎯 Xác định 3 mục tiêu chính cho hôm nay',
      '📝 Lập kế hoạch chi tiết cho ngày làm việc',
      '🚀 Bắt đầu với task khó nhất khi năng lượng đang cao'
    ]
  },
  [STATES.FOCUSED]: {
    name: 'Tập trung cao',
    emoji: '🧠',
    color: '#118AB2',
    description: 'Bạn đang ở trạng thái tập trung cao độ',
    recommendations: [
      '🔥 Tiếp tục duy trì flow state hiện tại',
      '🎧 Bật nhạc focus (không lời) để duy trì nhịp độ',
      '📊 Làm các task đòi hỏi sáng tạo và tư duy sâu',
      '⏰ Dùng Pomodoro 50/10 để tối ưu hiệu suất'
    ]
  },
  [STATES.UNMOTIVATED]: {
    name: 'Mất động lực',
    emoji: '😞',
    color: '#9B5DE5',
    description: 'Bạn không có động lực dù năng lượng vẫn ổn',
    recommendations: [
      '💡 Tìm lại "Why" - lý do bạn bắt đầu công việc này',
      '👥 Rủ một người bạn cùng làm để tạo accountability',
      '🎵 Đổi không gian làm việc hoặc nghe nhạc yêu thích',
      '📝 Viết ra 3 điều tích cực sẽ đạt được khi hoàn thành'
    ]
  }
};

class QuizScoringService {
  /**
   * Calculate normalized scores for each group
   */
  calculateGroupScores(answers) {
    const groups = {
      energy: [],
      work: [],
      psychology: [],
      environment: []
    };

    answers.forEach(answer => {
      groups[answer.group].push(answer.score);
    });

    const scores = {};
    for (const [group, scoresList] of Object.entries(groups)) {
      if (scoresList.length === 0) {
        scores[group] = 0;
        continue;
      }
      const average = scoresList.reduce((a, b) => a + b, 0) / scoresList.length;
      scores[group] = Math.round((average / 5) * 100);
    }

    return scores;
  }

  /**
   * Determine the user's state based on weighted scoring algorithm
   */
  determineState(scores) {
    const { energy, work, psychology, environment } = scores;
    
    // Weighted total score
    const total = Math.round(
      (energy * 0.35) + 
      (work * 0.30) + 
      (psychology * 0.20) + 
      (environment * 0.15)
    );

    // Has urgent deadlines (work score high, energy low)
    const hasUrgentDeadline = work >= 60;
    const isLowEnergy = energy <= 40;
    const isPsychologicallyLow = psychology <= 40;
    
    let state;
    
    if (energy <= 20 && psychology <= 30) {
      state = STATES.EXHAUSTED;
    } else if (energy <= 40 && !hasUrgentDeadline) {
      state = STATES.TIRED;
    } else if (isLowEnergy && hasUrgentDeadline) {
      state = STATES.LAZY_WITH_DEADLINE;
    } else if (energy >= 70 && psychology >= 70 && work >= 60) {
      state = STATES.FOCUSED;
    } else if (energy >= 50 && work >= 40 && psychology >= 50) {
      state = STATES.READY;
    } else {
      state = STATES.UNMOTIVATED;
    }

    return {
      state,
      total,
      details: STATE_DETAILS[state]
    };
  }

  /**
   * Full scoring pipeline
   */
  processQuiz(answers) {
    const scores = this.calculateGroupScores(answers);
    const result = this.determineState(scores);
    
    return {
      scores: {
        ...scores,
        total: result.total
      },
      state: result.state,
      stateDetails: result.details
    };
  }
}

module.exports = new QuizScoringService();
module.exports.STATES = STATES;
module.exports.STATE_DETAILS = STATE_DETAILS;