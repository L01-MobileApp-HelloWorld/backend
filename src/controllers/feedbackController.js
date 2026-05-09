const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res, next) => {
  try {
    const { type, severity, title, description } = req.body;
    
    if (!type || !title || !description) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      type,
      severity: severity || 'suggestion',
      title,
      description
    });

    res.status(201).json({ success: true, data: { feedback } });
  } catch (error) { next(error); }
};

exports.getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await Feedback.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const total = await Feedback.countDocuments();
    res.status(200).json({ success: true, data: { stats, total } });
  } catch (error) { next(error); }
};