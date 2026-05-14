const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const result = await pool.query('SELECT * FROM admins WHERE email=$1 AND is_active=TRUE', [email]);
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      success: true,
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Merchant login
const merchantLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = await pool.query(
      `SELECT m.*, ma.password_hash FROM merchants m
       JOIN merchant_auth ma ON m.id = ma.merchant_id
       WHERE m.phone=$1 AND m.status='active'`, [phone]
    );
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or account not active' });
    }
    const merchant = result.rows[0];
    const valid = await bcrypt.compare(password, merchant.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: merchant.id, phone: merchant.phone, role: 'merchant', type: 'merchant' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    await pool.query('UPDATE merchant_auth SET last_login=NOW() WHERE merchant_id=$1', [merchant.id]);
    res.json({
      success: true,
      token,
      user: {
        id: merchant.id,
        business_name: merchant.business_name,
        owner_name: merchant.owner_name,
        phone: merchant.phone,
        balance: merchant.balance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rider login with phone+password (OTP in Phase 2)
const riderLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = await pool.query(
      `SELECT r.*, ra.password_hash FROM riders r
       JOIN rider_auth ra ON r.id = ra.rider_id
       WHERE r.phone=$1 AND r.is_active=TRUE`, [phone]
    );
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const rider = result.rows[0];
    const valid = await bcrypt.compare(password, rider.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: rider.id, phone: rider.phone, role: 'rider', type: 'rider' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        status: rider.status,
        current_cash: rider.current_cash,
        cod_limit: rider.cod_limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { adminLogin, merchantLogin, riderLogin };