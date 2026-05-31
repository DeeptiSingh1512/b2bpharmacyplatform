const createNotification = async (userId, type, message, channel, pool) => {
  if (!userId || !type || !message || !channel || !pool) {
    throw new Error('Missing notification parameters');
  }

  await pool.request()
    .input('user_id', require('../config/db').sql.Int, userId)
    .input('type', require('../config/db').sql.NVarChar, type)
    .input('message', require('../config/db').sql.NVarChar, message)
    .input('channel', require('../config/db').sql.NVarChar, channel)
    .input('is_read', require('../config/db').sql.Bit, 0)
    .input('sent_at', require('../config/db').sql.DateTime, new Date())
    .query(`INSERT INTO Notifications (user_id, type, message, channel, is_read, sent_at)
            VALUES (@user_id, @type, @message, @channel, @is_read, @sent_at)`);
};

module.exports = { createNotification };