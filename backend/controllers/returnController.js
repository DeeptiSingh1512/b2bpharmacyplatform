const { poolPromise, sql } = require('../config/db');

const validReasons = ['Damaged', 'Expired', 'Incorrect product'];
const validStatuses = ['Approved', 'Rejected'];

exports.createReturn = async (req, res) => {
  try {
    const { order_id, reason, refund_method } = req.body;
    const userId = req.user.id;

    if (!order_id || !reason) {
      return res.status(400).json({ message: 'order_id and reason are required.' });
    }

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: `reason must be one of: ${validReasons.join(', ')}` });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('orderId', sql.Int, order_id)
      .input('userId', sql.Int, userId)
      .input('reason', sql.NVarChar, reason)
      .input('status', sql.NVarChar, 'Pending')
      .query(`INSERT INTO Returns (orderId, userId, reason, status, createdAt)
              VALUES (@orderId, @userId, @reason, @status, GETDATE());
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);

    return res.status(201).json({ message: 'Return request created.', returnId: result.recordset[0].id });
  } catch (error) {
    console.error('Create return error:', error);
    return res.status(500).json({ message: 'Failed to create return request.', error: error.message });
  }
};

exports.getReturns = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    let query = 'SELECT id, orderId, userId, reason, status, refundAmount, createdAt FROM Returns';

    if (req.user.role === 'retailer') {
      query += ' WHERE userId = @userId';
      request.input('userId', sql.Int, req.user.id);
    }

    query += ' ORDER BY createdAt DESC';

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    console.error('Get returns error:', error);
    return res.status(500).json({ message: 'Failed to load returns.', error: error.message });
  }
};

exports.updateReturnStatus = async (req, res) => {
  try {
    if (req.user.role !== 'distributor') {
      return res.status(403).json({ message: 'Distributor access required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query('UPDATE Returns SET status = @status WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Return not found.' });
    }

    return res.json({ message: 'Return status updated successfully.' });
  } catch (error) {
    console.error('Update return status error:', error);
    return res.status(500).json({ message: 'Failed to update return status.', error: error.message });
  }
};