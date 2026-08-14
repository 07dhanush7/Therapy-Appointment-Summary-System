const db = require('../config/db');

/**
 * Get recent activity logs.
 * GET /api/activities
 */
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await db.query(
      'SELECT activity_id, activity_type, activity_message, DATE_FORMAT(created_at, "%h:%i %p") AS formatted_time, created_at FROM activity_logs ORDER BY activity_id DESC LIMIT 10'
    );
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new activity log.
 * POST /api/activities
 */
exports.createActivityLog = async (req, res, next) => {
  try {
    const { activity_type, activity_message } = req.body;

    if (!activity_type || typeof activity_type !== 'string' || activity_type.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!activity_message || typeof activity_message !== 'string' || activity_message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const trimmedType = activity_type.trim();
    const trimmedMessage = activity_message.trim();

    const result = await db.query(
      'INSERT INTO activity_logs (activity_type, activity_message) VALUES (?, ?)',
      [trimmedType, trimmedMessage]
    );

    const [newLog] = await db.query(
      'SELECT activity_id, activity_type, activity_message, DATE_FORMAT(created_at, "%h:%i %p") AS formatted_time, created_at FROM activity_logs WHERE activity_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: newLog
    });
  } catch (error) {
    next(error);
  }
};
