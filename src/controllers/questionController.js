const Question = require('../models/Question');

exports.getQuestions = async (req, res, next) => {
  try {
    const { questionIds } = req.query;
    const query = {};

    if (questionIds) {
      const ids = questionIds
        .split(',')
        .map(id => Number(id.trim()))
        .filter(id => Number.isInteger(id));

      if (ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'questionIds phải là danh sách số, ví dụ: 1,2,3'
        });
      }

      query.questionId = { $in: [...new Set(ids)] };
    }

    const questions = await Question.find(query)
      .sort({ order: 1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      data: {
        questions,
        total: questions.length,
        groups: ['energy', 'work', 'psychology', 'environment']
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.seedQuestions = async (req, res, next) => {
  try {
    const questions = [
      {
        questionId: 1,
        group: 'energy',
        question: 'Mức năng lượng của bạn lúc này như thế nào?',
        hint: 'Hãy nghĩ về cảm giác trong cơ thể bạn ngay bây giờ',
        options: [
          { label: 'Hoàn toàn kiệt sức', emoji: '😫', subtext: 'Không thể mở mắt nổi', score: 1 },
          { label: 'Khá mệt mỏi', emoji: '😔', subtext: 'Cần gắng sức mới làm được', score: 2 },
          { label: 'Bình thường', emoji: '😐', subtext: 'Không tệ, không tốt', score: 3 },
          { label: 'Khá ổn', emoji: '🙂', subtext: 'Có thể làm việc được', score: 4 },
          { label: 'Tràn đầy năng lượng', emoji: '⚡', subtext: 'Sẵn sàng chinh phục mọi thứ', score: 5 }
        ],
        order: 1
      },
      {
        questionId: 2,
        group: 'energy',
        question: 'Đêm qua bạn ngủ bao nhiêu tiếng?',
        hint: 'Tính từ lúc lên giường đến khi thức dậy',
        options: [
          { label: 'Dưới 3 tiếng', emoji: '😵', subtext: 'Gần như thức trắng', score: 1 },
          { label: '3-5 tiếng', emoji: '😴', subtext: 'Ngủ không đủ giấc', score: 2 },
          { label: '5-6 tiếng', emoji: '😪', subtext: 'Tạm đủ nhưng chưa sâu', score: 3 },
          { label: '6-7 tiếng', emoji: '😊', subtext: 'Ngủ khá ngon', score: 4 },
          { label: 'Trên 7 tiếng', emoji: '🛏️', subtext: 'Ngủ rất đủ giấc', score: 5 }
        ],
        order: 2
      },
      {
        questionId: 3,
        group: 'energy',
        question: 'Bạn có cảm thấy đau mỏi cơ thể không?',
        hint: 'Đau lưng, mỏi cổ, nhức mắt...',
        options: [
          { label: 'Rất đau nhức toàn thân', emoji: '🤕', subtext: 'Không thể tập trung được', score: 1 },
          { label: 'Đau ở vài chỗ', emoji: '😣', subtext: 'Hơi khó chịu khi ngồi lâu', score: 2 },
          { label: 'Hơi mỏi nhẹ', emoji: '😐', subtext: 'Có thể bỏ qua được', score: 3 },
          { label: 'Khá thoải mái', emoji: '🙂', subtext: 'Cơ thể ổn định', score: 4 },
          { label: 'Hoàn toàn khỏe khoắn', emoji: '💪', subtext: 'Cơ thể sẵn sàng vận động', score: 5 }
        ],
        order: 3
      },
      {
        questionId: 4,
        group: 'work',
        question: 'Bạn có deadline gấp trong 24h tới không?',
        hint: 'Tính cả deadline cứng và deadline tự đặt',
        options: [
          { label: 'Có deadline trong 1-2h nữa', emoji: '🔥', subtext: 'Cực kỳ gấp!', score: 5 },
          { label: 'Deadline trong vài giờ tới', emoji: '⏰', subtext: 'Khá gấp', score: 4 },
          { label: 'Deadline cuối ngày', emoji: '📅', subtext: 'Còn thời gian', score: 3 },
          { label: 'Deadline vài ngày nữa', emoji: '📆', subtext: 'Chưa gấp lắm', score: 2 },
          { label: 'Không có deadline nào gấp', emoji: '🏖️', subtext: 'Thảnh thơi', score: 1 }
        ],
        order: 4
      },
      {
        questionId: 5,
        group: 'work',
        question: 'Khối lượng công việc hôm nay thế nào?',
        hint: 'Tổng số task bạn cần hoàn thành',
        options: [
          { label: 'Ngập trong task', emoji: '🌊', subtext: 'Không biết bắt đầu từ đâu', score: 5 },
          { label: 'Khá nhiều task', emoji: '📚', subtext: 'Cần sắp xếp ưu tiên', score: 4 },
          { label: 'Vừa phải', emoji: '📋', subtext: 'Có thể quản lý được', score: 3 },
          { label: 'Ít task', emoji: '📝', subtext: 'Nhẹ nhàng', score: 2 },
          { label: 'Gần như không có gì', emoji: '🍃', subtext: 'Ngày thư giãn', score: 1 }
        ],
        order: 5
      },
      {
        questionId: 6,
        group: 'psychology',
        question: 'Tâm trạng của bạn lúc này thế nào?',
        hint: 'Cảm xúc chủ đạo trong 30 phút qua',
        options: [
          { label: 'Rất tệ, stress nặng', emoji: '😢', subtext: 'Muốn bỏ cuộc', score: 1 },
          { label: 'Hơi buồn, lo lắng', emoji: '😟', subtext: 'Khó tập trung', score: 2 },
          { label: 'Bình thường', emoji: '😐', subtext: 'Không vui không buồn', score: 3 },
          { label: 'Khá tốt', emoji: '😊', subtext: 'Tinh thần ổn định', score: 4 },
          { label: 'Cực kỳ hứng khởi', emoji: '🤩', subtext: 'Sẵn sàng làm mọi thứ', score: 5 }
        ],
        order: 6
      },
      {
        questionId: 7,
        group: 'psychology',
        question: 'Bạn có động lực để làm việc không?',
        hint: 'Cảm giác muốn bắt tay vào làm ngay',
        options: [
          { label: 'Hoàn toàn không có', emoji: '😞', subtext: 'Chẳng muốn làm gì cả', score: 1 },
          { label: 'Rất ít động lực', emoji: '😒', subtext: 'Làm vì bắt buộc', score: 2 },
          { label: 'Động lực trung bình', emoji: '🤔', subtext: 'Cần thêm chút cảm hứng', score: 3 },
          { label: 'Khá có động lực', emoji: '💡', subtext: 'Muốn hoàn thành việc hôm nay', score: 4 },
          { label: 'Cực kỳ có động lực', emoji: '🚀', subtext: 'Muốn chinh phục mục tiêu ngay!', score: 5 }
        ],
        order: 7
      },
      {
        questionId: 8,
        group: 'environment',
        question: 'Không gian xung quanh bạn thế nào?',
        hint: 'Ánh sáng, tiếng ồn, nhiệt độ...',
        options: [
          { label: 'Rất ồn ào, khó chịu', emoji: '🔊', subtext: 'Không thể tập trung', score: 1 },
          { label: 'Hơi ồn, hơi khó chịu', emoji: '🌆', subtext: 'Thỉnh thoảng bị phân tâm', score: 2 },
          { label: 'Bình thường', emoji: '🏠', subtext: 'Chấp nhận được', score: 3 },
          { label: 'Khá yên tĩnh', emoji: '📚', subtext: 'Dễ tập trung', score: 4 },
          { label: 'Rất lý tưởng', emoji: '🌿', subtext: 'Yên tĩnh, thoải mái, đủ sáng', score: 5 }
        ],
        order: 8
      },
      {
        questionId: 9,
        group: 'environment',
        question: 'Bạn có bị phân tâm bởi điện thoại/mạng xã hội không?',
        hint: 'Tần suất bạn check điện thoại trong lúc làm việc',
        options: [
          { label: 'Cứ vài phút lại check', emoji: '📱', subtext: 'Nghiện điện thoại nặng', score: 1 },
          { label: 'Khá thường xuyên', emoji: '🔔', subtext: 'Có thông báo là check ngay', score: 2 },
          { label: 'Thỉnh thoảng', emoji: '📲', subtext: 'Check khi giải lao', score: 3 },
          { label: 'Hiếm khi', emoji: '📴', subtext: 'Đã tắt thông báo', score: 4 },
          { label: 'Hoàn toàn không', emoji: '🧘', subtext: 'Đang focus mode', score: 5 }
        ],
        order: 9
      },
      {
        questionId: 10,
        group: 'work',
        question: 'Bạn đã bắt đầu làm việc được bao lâu rồi?',
        hint: 'Tính từ lúc bắt đầu phiên làm việc hiện tại',
        options: [
          { label: 'Chưa bắt đầu gì cả', emoji: '😴', subtext: 'Vẫn đang trì hoãn', score: 1 },
          { label: 'Mới bắt đầu < 30 phút', emoji: '🌅', subtext: 'Đang khởi động', score: 2 },
          { label: 'Được 30-60 phút', emoji: '⏱️', subtext: 'Đang vào guồng', score: 3 },
          { label: '1-2 tiếng', emoji: '📊', subtext: 'Đã có tiến triển', score: 4 },
          { label: 'Trên 2 tiếng', emoji: '🏆', subtext: 'Đang rất productive', score: 5 }
        ],
        order: 10
      }
    ];

    await Question.deleteMany({});
    await Question.insertMany(questions);

    res.status(201).json({
      success: true,
      message: 'Đã tạo 10 câu hỏi mặc định',
      data: { total: questions.length }
    });
  } catch (error) {
    next(error);
  }
};
