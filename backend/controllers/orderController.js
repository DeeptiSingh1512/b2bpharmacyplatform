const { poolPromise, sql } = require('../config/db');
const { createNotification } = require('../services/notificationService');

exports.createOrder = async (req, res) => {
  try {
    const { items, payment_method } = req.body;
    const userId = req.user.id;
    const pool = await poolPromise;

    let totalPrice = 0;

    for (const item of items) {
      const productResult = await pool.request()
        .input('id', sql.Int, item.product_id)
        .query('SELECT price, stock FROM Products WHERE id = @id');

      if (productResult.recordset.length === 0)
        return res.status(404).json({ message: `Product ${item.product_id} not found` });

      const product = productResult.recordset[0];

      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });

      totalPrice += product.price * item.quantity;

      // Deduct stock
      await pool.request()
        .input('id', sql.Int, item.product_id)
        .input('quantity', sql.Int, item.quantity)
        .query('UPDATE Products SET stock = stock - @quantity WHERE id = @id');
    }

    // Insert Order
    const orderResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('totalPrice', sql.Decimal(18, 2), totalPrice)
      .input('status', sql.NVarChar, 'Pending')
      .query(`INSERT INTO Orders (userId, totalPrice, status, orderDate, createdAt)
              VALUES (@userId, @totalPrice, @status, GETDATE(), GETDATE());
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);

    const orderId = orderResult.recordset[0].id;

    // Insert Order Items
    for (const item of items) {
      const productResult = await pool.request()
        .input('id', sql.Int, item.product_id)
        .query('SELECT price FROM Products WHERE id = @id');

      const unitPrice = productResult.recordset[0].price;

      await pool.request()
        .input('order_id', sql.Int, orderId)
        .input('product_id', sql.Int, item.product_id)
        .input('quantity', sql.Int, item.quantity)
        .input('unit_price', sql.Decimal(18, 2), unitPrice)
        .query(`INSERT INTO OrderItems (order_id, product_id, quantity, unit_price)
                VALUES (@order_id, @product_id, @quantity, @unit_price)`);
    }

    await createNotification(userId, 'order', 'Your order has been placed successfully', 'app', pool);

    return res.status(201).json({
      message: '✅ Order created successfully',
      orderId,
      totalPrice
    });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    let query;

    if (req.user.role === 'distributor') {
      query = `SELECT o.*, u.fullName as retailerName 
               FROM Orders o 
               JOIN Users u ON o.userId = u.id 
               ORDER BY o.createdAt DESC`;
    } else {
      request.input('userId', sql.Int, req.user.id);
      query = `SELECT * FROM Orders WHERE userId = @userId ORDER BY createdAt DESC`;
    }

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const orderResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Orders WHERE id = @id');

    if (orderResult.recordset.length === 0)
      return res.status(404).json({ message: 'Order not found' });

    const itemsResult = await pool.request()
      .input('order_id', sql.Int, id)
      .query(`SELECT oi.*, p.productName 
              FROM OrderItems oi 
              JOIN Products p ON oi.product_id = p.id 
              WHERE oi.order_id = @order_id`);

    return res.json({
      order: orderResult.recordset[0],
      items: itemsResult.recordset
    });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'distributor')
      return res.status(403).json({ message: 'Distributor access required' });

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Packed', 'Dispatched', 'Delivered'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const pool = await poolPromise;
    const orderResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT userId FROM Orders WHERE id = @id');

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const retailerId = orderResult.recordset[0].userId;

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query('UPDATE Orders SET status = @status WHERE id = @id');

    await createNotification(retailerId, 'status', `Your order status has been updated to ${status}`, 'app', pool);

    return res.json({ message: `✅ Order status updated to ${status}` });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};