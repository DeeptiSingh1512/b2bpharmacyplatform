const { poolPromise, sql } = require('../config/db');

const isDistributor = (req) => req.user && req.user.role === 'distributor';
const isRetailer = (req) => req.user && req.user.role === 'retailer';

exports.getCredit = async (req, res) => {
  try {
    const { retailerId } = req.params;
    const requesterId = req.user.id;

    if (isRetailer(req) && Number(retailerId) !== Number(requesterId)) {
      return res.status(403).json({ message: 'Retailers can only access their own credit info.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('retailerId', sql.Int, retailerId)
      .query('SELECT credit_limit, used_credit FROM CreditLimits WHERE retailer_id = @retailerId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Credit limit record not found for retailer.' });
    }

    const record = result.recordset[0];
    const creditLimit = Number(record.credit_limit || 0);
    const usedCredit = Number(record.used_credit || 0);
    const remaining = creditLimit - usedCredit;

    return res.json({ retailerId: Number(retailerId), credit_limit: creditLimit, used_credit: usedCredit, remaining });
  } catch (error) {
    console.error('Credit fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch credit information.' });
  }
};

exports.setCredit = async (req, res) => {
  try {
    if (!isDistributor(req)) {
      return res.status(403).json({ message: 'Distributor access required.' });
    }

    const { retailer_id, credit_limit } = req.body;

    if (!retailer_id) {
      return res.status(400).json({ message: 'retailer_id is required.' });
    }

    if (credit_limit == null || Number(credit_limit) < 0) {
      return res.status(400).json({ message: 'A non-negative credit_limit is required.' });
    }

    const pool = await poolPromise;
    const existing = await pool.request()
      .input('retailerId', sql.Int, retailer_id)
      .query('SELECT id FROM CreditLimits WHERE retailer_id = @retailerId');

    if (existing.recordset.length > 0) {
      await pool.request()
        .input('credit_limit', sql.Decimal(18, 2), credit_limit)
        .input('retailerId', sql.Int, retailer_id)
        .query('UPDATE CreditLimits SET credit_limit = @credit_limit WHERE retailer_id = @retailerId');
      return res.json({ message: 'Credit limit updated successfully.' });
    }

    await pool.request()
      .input('retailerId', sql.Int, retailer_id)
      .input('credit_limit', sql.Decimal(18, 2), credit_limit)
      .input('used_credit', sql.Decimal(18, 2), 0)
      .input('created_at', sql.DateTime, new Date())
      .query('INSERT INTO CreditLimits (retailer_id, credit_limit, used_credit, created_at) VALUES (@retailerId, @credit_limit, @used_credit, @created_at)');

    return res.status(201).json({ message: 'Credit limit assigned successfully.' });
  } catch (error) {
    console.error('Set credit error:', error);
    return res.status(500).json({ message: 'Failed to set credit limit.', error: error.message });
  }
};

exports.requestCredit = async (req, res) => {
  try {
    if (!isRetailer(req)) {
      return res.status(403).json({ message: 'Retailer access required.' });
    }

    const { amount, note } = req.body;
    if (amount == null || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A positive amount is required for credit request.' });
    }

    return res.status(202).json({
      message: 'Credit increase request received.',
      retailerId: req.user.id,
      requested_amount: Number(amount),
      note: note || null,
    });
  } catch (error) {
    console.error('Credit request error:', error);
    return res.status(500).json({ message: 'Failed to submit credit request.' });
  }
};