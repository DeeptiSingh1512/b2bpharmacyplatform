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

// ── Bulk Import ────────────────────────────────────────────────────────────────
exports.importProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'products array is required and must not be empty.' });
    }

    if (products.length > 500) {
      return res.status(400).json({ message: 'Maximum 500 products per import.' });
    }

    const pool = await poolPromise;
    let imported = 0;
    const failed = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];

      // Row-level validation
      if (!p.productName || p.productName.trim() === '') {
        failed.push({ row: i + 2, message: 'productName is required' });
        continue;
      }
      if (p.price != null && isNaN(Number(p.price))) {
        failed.push({ row: i + 2, message: 'price must be a number' });
        continue;
      }

      try {
        await pool.request()
          .input('productName', sql.NVarChar, String(p.productName).trim())
          .input('description', sql.NVarChar, p.description ? String(p.description) : null)
          .input('price', sql.Decimal(18, 2), p.price != null ? Number(p.price) : 0)
          .input('stock', sql.Int, p.stock != null ? Number(p.stock) : 0)
          .input('category', sql.NVarChar, p.category ? String(p.category) : null)
          .input('imageUrl', sql.NVarChar, p.imageUrl ? String(p.imageUrl) : null)
          .input('hsnCode', sql.NVarChar, p.hsnCode ? String(p.hsnCode) : null)
          .input('batchNumber', sql.NVarChar, p.batchNumber ? String(p.batchNumber) : null)
          .input('manufacturingDate', sql.Date, p.manufacturingDate || null)
          .input('expiryDate', sql.Date, p.expiryDate || null)
          .query(`INSERT INTO Products
            (productName, description, price, stock, category, imageUrl, hsnCode, batchNumber, manufacturingDate, expiryDate)
            VALUES
            (@productName, @description, @price, @stock, @category, @imageUrl, @hsnCode, @batchNumber, @manufacturingDate, @expiryDate)`);
        imported++;
      } catch (rowErr) {
        failed.push({ row: i + 2, message: rowErr.message });
      }
    }

    return res.status(201).json({ imported, failed });
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: 'Import failed.', error: error.message });
  }
};

// ── Export CSV ─────────────────────────────────────────────────────────────────
exports.exportProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `SELECT id AS productID, productName, productName AS title, description, imageUrl AS image,
              category, price, stock, hsnCode, batchNumber, expiryDate FROM Products ORDER BY id`
    );

    const rows = result.recordset;
    const headers = ['productID','productName','title','description','image','category','price','stock','hsnCode','batchNumber','expiryDate'];
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('FULL ERROR:', error);
    return res.status(500).json({ message: 'Export failed.', error: error.message });
  }
};
