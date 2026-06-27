const { poolPromise, sql } = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query('SELECT id, type, message, channel, is_read, sent_at FROM Notifications WHERE user_id = @user_id ORDER BY sent_at DESC');

    return res.json(result.recordset);
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Failed to load notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('user_id', sql.Int, userId)
      .query('UPDATE Notifications SET is_read = 1 WHERE id = @id AND user_id = @user_id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Notification not found or not accessible.' });
    }

    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('UPDATE Notifications SET is_read = 1 WHERE user_id = @user_id AND is_read = 0');

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ message: 'Failed to mark notifications as read.' });
  }
};
