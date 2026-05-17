const History = require('../models/History');
const User = require('../models/User');
const quizScoringService = require('../services/quizScoringService');

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
