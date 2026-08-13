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
