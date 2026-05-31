const { poolPromise, sql } = require('../config/db');

const isRetailer = (req) => req.user && req.user.role === 'retailer';

exports.createPayment = async (req, res) => {
  try {
    const { order_id, amount, method } = req.body;
    const userId = req.user.id;

    if (!amount || !method) {
      return res.status(400).json({ message: 'amount and method are required.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('invoiceId', sql.Int, order_id || null)
      .input('userId', sql.Int, userId)
      .input('amount', sql.Decimal(18, 2), amount)
      .input('paymentMode', sql.NVarChar, method)
      .query(`INSERT INTO Payments (invoiceId, userId, amount, paymentMode, createdAt)
              VALUES (@invoiceId, @userId, @amount, @paymentMode, GETDATE());
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);

    return res.status(201).json({ message: 'Payment recorded successfully.', paymentId: result.recordset[0].id });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ message: 'Failed to create payment.', error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    let query = `SELECT id, invoiceId, userId, amount, paymentMode, createdAt FROM Payments`;

    if (isRetailer(req)) {
      query += ' WHERE userId = @userId';
      request.input('userId', sql.Int, req.user.id);
    }

    query += ' ORDER BY createdAt DESC';

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ message: 'Failed to fetch payments.', error: error.message });
  }
};