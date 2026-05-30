const { poolPromise, sql } = require('../config/db');

exports.addBatch = async (req, res) => {
  try {
    const { product_id, batch_number, mfg_date, expiry_date, quantity } = req.body;

    if (!product_id || !batch_number || !expiry_date || quantity == null) {
      return res.status(400).json({ message: 'product_id, batch_number, expiry_date, and quantity are required.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('product_id', sql.Int, product_id)
      .input('batch_number', sql.VarChar(255), batch_number)
      .input('mfg_date', sql.Date, mfg_date ? new Date(mfg_date) : null)
      .input('expiry_date', sql.Date, new Date(expiry_date))
      .input('quantity', sql.Int, quantity)
      .input('created_at', sql.DateTime, new Date())
      .query(
        `INSERT INTO InventoryBatches (product_id, batch_number, mfg_date, expiry_date, quantity, created_at)
         VALUES (@product_id, @batch_number, @mfg_date, @expiry_date, @quantity, @created_at);
         SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`
      );

    return res.status(201).json({ message: 'Batch added successfully.', batchId: result.recordset[0].id });
  } catch (error) {
    console.error('Error adding inventory batch:', error);
    return res.status(500).json({ message: 'Failed to add batch.' });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const { productId } = req.params;
    const pool = await poolPromise;
    const today = new Date();

    const result = await pool
      .request()
      .input('productId', sql.Int, productId)
      .input('today', sql.Date, today)
      .query(
        `SELECT id, product_id, batch_number, mfg_date, expiry_date, quantity, created_at
         FROM InventoryBatches
         WHERE product_id = @productId AND expiry_date >= @today
         ORDER BY expiry_date ASC`
      );

    return res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return res.status(500).json({ message: 'Failed to fetch batches.' });
  }
};
