const History = require('../models/History');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    // Tổng số users
    const totalUsers = await User.countDocuments();

    // Users mới trong 30 ngày
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Tổng số quiz đã làm
    const totalQuizzes = await History.countDocuments();

    // Quiz trong 30 ngày
    const recentQuizzes = await History.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Phân bố trạng thái
    const stateDistribution = await History.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Retention: users làm quiz >1 lần
    const returningUsers = await History.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'returningUsers' }
    ]);
    const returnRate = totalUsers > 0 
      ? Math.round(((returningUsers[0]?.returningUsers || 0) / totalUsers) * 100) 
      : 0;

    // Drop-off: users chỉ làm 1 lần
    const oneTimeUsers = await History.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: 1 } },
      { $count: 'oneTimeUsers' }
    ]);
    const dropOffRate = totalUsers > 0
      ? Math.round(((oneTimeUsers[0]?.oneTimeUsers || 0) / totalUsers) * 100)
      : 0;

    // Thời gian làm quiz trung bình (giây)
    const avgCompletionTime = await History.aggregate([
      { $match: { 'meta.completionTime': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$meta.completionTime' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersLast30Days: newUsers,
          totalQuizzes,
          quizzesLast30Days: recentQuizzes,
          returnRate: `${returnRate}%`,
          dropOffRate: `${dropOffRate}%`,
          avgCompletionTimeSeconds: Math.round(avgCompletionTime[0]?.avg || 0),
        },
        stateDistribution,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSessionAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    // Quiz theo ngày
    const dailyQuizzes = await History.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Active users theo ngày
    const dailyActiveUsers = await History.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          uniqueUsers: { $addToSet: '$userId' },
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: '$uniqueUsers' },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        dailyQuizzes,
        dailyActiveUsers,
      }
    });
  } catch (error) {
    next(error);
  }
};