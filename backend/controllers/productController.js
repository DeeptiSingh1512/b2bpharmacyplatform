const { poolPromise, sql } = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const pool = await poolPromise;
    let query = `SELECT id, productName, description, price, stock, category, 
                 imageUrl, hsnCode, batchNumber, manufacturingDate, expiryDate, createdAt 
                 FROM Products WHERE 1=1`;
    const request = pool.request();

    if (category) {
      query += ' AND category = @category';
      request.input('category', sql.NVarChar, category);
    }

    if (search) {
      query += ' AND productName LIKE @search';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { productName, description, price, stock, category, imageUrl, hsnCode, batchNumber, manufacturingDate, expiryDate } = req.body;

    if (!productName || price == null) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('productName', sql.NVarChar, productName)
      .input('description', sql.NVarChar, description || null)
      .input('price', sql.Decimal(18, 2), price)
      .input('stock', sql.Int, stock || 0)
      .input('category', sql.NVarChar, category || null)
      .input('imageUrl', sql.NVarChar, imageUrl || null)
      .input('hsnCode', sql.NVarChar, hsnCode || null)
      .input('batchNumber', sql.NVarChar, batchNumber || null)
      .input('manufacturingDate', sql.Date, manufacturingDate || null)
      .input('expiryDate', sql.Date, expiryDate || null)
      .query(`INSERT INTO Products 
              (productName, description, price, stock, category, imageUrl, hsnCode, batchNumber, manufacturingDate, expiryDate)
              VALUES 
              (@productName, @description, @price, @stock, @category, @imageUrl, @hsnCode, @batchNumber, @manufacturingDate, @expiryDate);
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);

    return res.status(201).json({ message: 'Product created successfully.', productId: result.recordset[0].id });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, description, price, stock, category, imageUrl, hsnCode, batchNumber, manufacturingDate, expiryDate } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('productName', sql.NVarChar, productName)
      .input('description', sql.NVarChar, description || null)
      .input('price', sql.Decimal(18, 2), price)
      .input('stock', sql.Int, stock || 0)
      .input('category', sql.NVarChar, category || null)
      .input('imageUrl', sql.NVarChar, imageUrl || null)
      .input('hsnCode', sql.NVarChar, hsnCode || null)
      .input('batchNumber', sql.NVarChar, batchNumber || null)
      .input('manufacturingDate', sql.Date, manufacturingDate || null)
      .input('expiryDate', sql.Date, expiryDate || null)
      .query(`UPDATE Products SET 
              productName=@productName, description=@description, price=@price, 
              stock=@stock, category=@category, imageUrl=@imageUrl, hsnCode=@hsnCode,
              batchNumber=@batchNumber, manufacturingDate=@manufacturingDate, expiryDate=@expiryDate
              WHERE id=@id`);

    return res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Products WHERE id = @id');

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
};
