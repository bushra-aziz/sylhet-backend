const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Get all merchants
const getAllMerchants = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, business_name, owner_name, phone, email, status, balance, created_at FROM merchants ORDER BY created_at DESC'
    );
    res.json({ success: true, merchants: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create merchant (admin)
const createMerchant = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { business_name, owner_name, phone, email, address, custom_delivery_rate, password } = req.body;
    const hash = await bcrypt.hash(password || phone, 10);

    const result = await client.query(
      `INSERT INTO merchants (business_name, owner_name, phone, email, address, custom_delivery_rate, status)
       VALUES ($1,$2,$3,$4,$5,$6,'active') RETURNING *`,
      [business_name, owner_name, phone, email||null, address||null, custom_delivery_rate||null]
    );
    const merchant = result.rows[0];
    await client.query(
      'INSERT INTO merchant_auth (merchant_id, password_hash) VALUES ($1,$2)', [merchant.id, hash]
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, merchant });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
};

// Update merchant status (admin)
const updateMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { status, custom_delivery_rate } = req.body;
    const result = await pool.query(
      `UPDATE merchants SET
        status=COALESCE($1,status),
        custom_delivery_rate=COALESCE($2,custom_delivery_rate),
        updated_at=NOW()
       WHERE id=$3 RETURNING *`, [status, custom_delivery_rate, merchantId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }
    res.json({ success: true, merchant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Merchant payout (admin)
const recordPayout = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { merchantId } = req.params;
    const { amount, payment_method, notes } = req.body;
    const admin_id = req.user.id;

    await client.query(
      'INSERT INTO merchant_payouts (merchant_id, amount, paid_by, payment_method, notes) VALUES ($1,$2,$3,$4,$5)',
      [merchantId, amount, admin_id, payment_method||'cash', notes||null]
    );
    await client.query(
      'UPDATE merchants SET balance = balance - $1, updated_at=NOW() WHERE id=$2',
      [amount, merchantId]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Payout recorded' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

// Get merchant's own ledger
const getMerchantLedger = async (req, res) => {
  try {
    const merchant_id = req.user.id;
    const orders = await pool.query(
      `SELECT tracking_id, status, cod_amount, delivery_charge, delivered_at, created_at
       FROM orders WHERE merchant_id=$1 AND is_deleted=FALSE
       ORDER BY created_at DESC LIMIT 50`, [merchant_id]
    );
    const payouts = await pool.query(
      'SELECT amount, payment_method, created_at FROM merchant_payouts WHERE merchant_id=$1 ORDER BY created_at DESC LIMIT 20',
      [merchant_id]
    );
    const merchant = await pool.query(
      'SELECT balance, business_name FROM merchants WHERE id=$1', [merchant_id]
    );
    res.json({
      success: true,
      balance: merchant.rows[0]?.balance,
      orders: orders.rows,
      payouts: payouts.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get zones (for order creation dropdown)
const getZones = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM zones WHERE is_active=TRUE ORDER BY name');
    res.json({ success: true, zones: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllMerchants, createMerchant, updateMerchant, recordPayout, getMerchantLedger, getZones };