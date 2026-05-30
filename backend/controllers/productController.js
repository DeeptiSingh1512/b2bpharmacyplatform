const { poolPromise, sql } = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, company, search } = req.query;
    const pool = await poolPromise;
    let query = 'SELECT id, name, description, hsn_code, category, company, price, gst_percent, image_url, is_active FROM Products WHERE is_active = 1';
    const request = pool.request();

    if (category) {
      query += ' AND category = @category';
      request.input('category', sql.VarChar(255), category);
    }

    if (company) {
      query += ' AND company = @company';
      request.input('company', sql.VarChar(255), company);
    }

    if (search) {
      query += ' AND name LIKE @search';
      request.input('search', sql.VarChar(255), `%${search}%`);
    }

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

const requireDistributor = (req, res) => {
  if (!req.user || req.user.role !== 'distributor') {
    res.status(403).json({ message: 'Distributor access required.' });
    return false;
  }
  return true;
};

exports.createProduct = async (req, res) => {
  if (!requireDistributor(req, res)) return;

  try {
    const { name, description, hsn_code, category, company, price, gst_percent, image_url } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('name', sql.VarChar(255), name)
      .input('description', sql.Text, description || null)
      .input('hsn_code', sql.VarChar(100), hsn_code || null)
      .input('category', sql.VarChar(255), category || null)
      .input('company', sql.VarChar(255), company || null)
      .input('price', sql.Decimal(18, 2), price)
      .input('gst_percent', sql.Decimal(5, 2), gst_percent == null ? 0 : gst_percent)
      .input('image_url', sql.VarChar(2048), image_url || null)
      .input('is_active', sql.Bit, 1)
      .query(
        `INSERT INTO Products (name, description, hsn_code, category, company, price, gst_percent, image_url, is_active)
         VALUES (@name, @description, @hsn_code, @category, @company, @price, @gst_percent, @image_url, @is_active);
         SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`
      );

    return res.status(201).json({ message: 'Product created successfully.', productId: result.recordset[0].id });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Failed to create product.' });
  }
};

exports.updateProduct = async (req, res) => {
  if (!requireDistributor(req, res)) return;

  try {
    const { id } = req.params;
    const { name, description, hsn_code, category, company, price, gst_percent, image_url, is_active } = req.body;

    const updateFields = [];
    const request = (await poolPromise).request().input('id', sql.Int, id);

    if (name !== undefined) {
      updateFields.push('name = @name');
      request.input('name', sql.VarChar(255), name);
    }
    if (description !== undefined) {
      updateFields.push('description = @description');
      request.input('description', sql.Text, description);
    }
    if (hsn_code !== undefined) {
      updateFields.push('hsn_code = @hsn_code');
      request.input('hsn_code', sql.VarChar(100), hsn_code);
    }
    if (category !== undefined) {
      updateFields.push('category = @category');
      request.input('category', sql.VarChar(255), category);
    }
    if (company !== undefined) {
      updateFields.push('company = @company');
      request.input('company', sql.VarChar(255), company);
    }
    if (price !== undefined) {
      updateFields.push('price = @price');
      request.input('price', sql.Decimal(18, 2), price);
    }
    if (gst_percent !== undefined) {
      updateFields.push('gst_percent = @gst_percent');
      request.input('gst_percent', sql.Decimal(5, 2), gst_percent);
    }
    if (image_url !== undefined) {
      updateFields.push('image_url = @image_url');
      request.input('image_url', sql.VarChar(2048), image_url);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = @is_active');
      request.input('is_active', sql.Bit, is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No update fields provided.' });
    }

    const pool = await poolPromise;
    const query = `UPDATE Products SET ${updateFields.join(', ')} WHERE id = @id`; 
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Failed to update product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  if (!requireDistributor(req, res)) return;

  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE Products SET is_active = 0 WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Failed to delete product.' });
  }
};
