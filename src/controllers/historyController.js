const History = require('../models/History');
const User = require('../models/User');
const Question = require('../models/Question');
const quizScoringService = require('../services/quizScoringService');

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const buildRandomAnswers = (questions) => {
  return questions.map((question) => {
    const selectedOption = randomInt(0, 4);

    return {
      questionId: question.questionId,
      group: question.group,
      selectedOption,
      score: selectedOption + 1
    };
  });
};

const buildSeedHistory = (userId, questions, index) => {
  const answers = buildRandomAnswers(questions);
  const result = quizScoringService.processQuiz(answers);
  const createdAt = new Date();

  createdAt.setDate(createdAt.getDate() - index);
  createdAt.setHours(randomInt(6, 23), randomInt(0, 59), randomInt(0, 59), 0);

  return {
    userId,
    answers,
    scores: result.scores,
    state: result.state,
    stateDetails: result.stateDetails,
    meta: {
      completionTime: randomInt(45, 600),
      deviceInfo: ['iPhone', 'Android', 'Web'][index % 3],
      appVersion: 'seed-script-1.0.0'
    },
    createdAt
  };
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, meta } = req.body;

    if (!answers || answers.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Cần trả lời đủ 10 câu hỏi'
      });
    }

    // Process quiz scoring
    const result = quizScoringService.processQuiz(answers);

    // Create history record
    const history = await History.create({
      userId: req.user.id,
      answers,
      scores: result.scores,
      state: result.state,
      stateDetails: result.stateDetails,
      meta: meta || {}
    });

    // Update user stats
    const user = await User.findById(req.user.id);
    const today = new Date().toDateString();
    const lastQuizDate = user.stats.lastQuizDate 
      ? new Date(user.stats.lastQuizDate).toDateString() 
      : null;

    if (lastQuizDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastQuizDate === yesterday.toDateString()) {
        user.stats.currentStreak += 1;
      } else {
        user.stats.currentStreak = 1;
      }
      
      user.stats.longestStreak = Math.max(
        user.stats.longestStreak, 
        user.stats.currentStreak
      );
      user.stats.lastQuizDate = new Date();
    }
    
    user.stats.totalQuizzes += 1;
    await user.save();

    res.status(201).json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

exports.seedHistories = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, questions] = await Promise.all([
      User.findById(userId),
      Question.find({})
        .sort({ order: 1, questionId: 1 })
        .select('questionId group options')
        .lean()
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chưa có dữ liệu câu hỏi để seed history'
      });
    }

    const histories = Array.from({ length: 100 }, (_, index) => {
      return buildSeedHistory(user._id, questions, index);
    });

    const insertedHistories = await History.insertMany(histories);

    user.stats.totalQuizzes += insertedHistories.length;
    user.stats.lastQuizDate = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: `Đã tạo ${insertedHistories.length} history cho user hiện tại`,
      data: {
        userId: user._id,
        count: insertedHistories.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      startDate,
      endDate,
      state,
      sort = 'createdAt:desc'
    } = req.query;

    const query = { userId: req.user.id };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (state) {
      query.state = state;
    }

    const [sortField, sortOrder] = sort.split(':');
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const total = await History.countDocuments(query);
    const histories = await History.find(query)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-answers'); // Exclude detailed answers for list view

    res.status(200).json({
      success: true,
      data: {
        histories,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistoryById = async (req, res, next) => {
  try {
    const history = await History.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử kiểm tra'
      });
    }

    res.status(200).json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      // Delete all history for user
      await History.deleteMany({ userId: req.user.id });
      
      return res.status(200).json({
        success: true,
        message: 'Đã xóa tất cả lịch sử'
      });
    }

    const history = await History.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa lịch sử thành công'
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [stats, recentStates] = await Promise.all([
      User.findById(req.user.id).select('stats'),
      History.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(req.user.id) } },
        { $group: {
          _id: '$state',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ])
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentQuizzes = await History.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        stats: stats.stats,
        stateDistribution: recentStates,
        recentQuizzes
      }
    });
  } catch (error) {
    next(error);
  }
};
