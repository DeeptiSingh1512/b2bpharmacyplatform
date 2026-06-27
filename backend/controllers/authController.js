const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/db');

const JWT_SECRET = 'b2bpharma_secret_key_2024';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone, name } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email, and password are required.' });
    }

    const pool = await poolPromise;
    const existingUser = await pool
      .request()
      .input('email', sql.VarChar(255), email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date();
    const userName = name || fullName;

    const insertResult = await pool
      .request()
      .input('fullName', sql.VarChar(255), fullName)
      .input('email', sql.VarChar(255), email)
      .input('password', sql.VarChar(255), hashedPassword)
      .input('role', sql.VarChar(50), 'retailer')
      .input('phone', sql.VarChar(50), phone || null)
      .input('createdAt', sql.DateTime, createdAt)
      .input('name', sql.VarChar(255), userName)
      .input('isApproved', sql.Bit, 0)
      .query(
        `INSERT INTO Users (fullName, email, password, role, phone, createdAt, name, isApproved)
         VALUES (@fullName, @email, @password, @role, @phone, @createdAt, @name, @isApproved);
         SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`
      );

    const insertedId = insertResult.recordset[0]?.id;

    return res.status(201).json({
      message: 'Registration successful. Await approval.',
      userId: insertedId,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('email', sql.VarChar(255), email)
      .query('SELECT id, fullName, name, role, password, isApproved FROM Users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isApproved !== true && user.isApproved !== 1) {
      return res.status(403).json({ message: 'Account is not approved.' });
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      name: user.name || user.fullName,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: tokenPayload });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getRetailers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'distributor') {
      return res.status(403).json({ message: 'Distributor access required.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT u.id, u.fullName, u.email, u.phone, u.name, u.role, u.isApproved, u.createdAt,
              c.credit_limit, c.used_credit
              FROM Users u
              LEFT JOIN CreditLimits c ON c.retailer_id = u.id
              WHERE u.role = 'retailer'
              ORDER BY u.createdAt DESC`);

    return res.json(result.recordset);
  } catch (error) {
    console.error('Get retailers error:', error);
    return res.status(500).json({ message: 'Server error while fetching retailers.' });
  }
};

exports.approveRetailer = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'distributor') {
      return res.status(403).json({ message: 'Distributor access required.' });
    }

    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query("UPDATE Users SET isApproved = 1 WHERE id = @id AND role = 'retailer'");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Retailer not found.' });
    }

    return res.json({ message: 'Retailer approved successfully.' });
  } catch (error) {
    console.error('Approve retailer error:', error);
    return res.status(500).json({ message: 'Server error while approving retailer.' });
  }
};

exports.rejectRetailer = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'distributor') {
      return res.status(403).json({ message: 'Distributor access required.' });
    }

    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query("DELETE FROM Users WHERE id = @id AND role = 'retailer' AND isApproved = 0");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Pending retailer not found.' });
    }

    return res.json({ message: 'Retailer registration rejected.' });
  } catch (error) {
    console.error('Reject retailer error:', error);
    return res.status(500).json({ message: 'Server error while rejecting retailer.' });
  }
};
