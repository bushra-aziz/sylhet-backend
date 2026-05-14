const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Get all riders (admin)
const getAllRiders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, status, is_active, current_cash, cod_limit, total_earnings, created_at
       FROM riders ORDER BY created_at DESC`
    );
    res.json({ success: true, riders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create rider (admin)
const createRider = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, phone, password, cod_limit } = req.body;
    const hash = await bcrypt.hash(password || phone, 10);

    const result = await client.query(
      `INSERT INTO riders (name, phone, cod_limit, is_active, status)
       VALUES ($1, $2, $3, TRUE, 'offline') RETURNING *`,
      [name, phone, cod_limit || 10000]
    );
    const rider = result.rows[0];
    await client.query(
      'INSERT INTO rider_auth (rider_id, password_hash) VALUES ($1, $2)',
      [rider.id, hash]
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, rider });
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

// Update rider (admin) - status, cod_limit, suspend
const updateRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { is_active, cod_limit } = req.body;
    const result = await pool.query(
      `UPDATE riders SET
        is_active=COALESCE($1, is_active),
        cod_limit=COALESCE($2, cod_limit),
        updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [is_active, cod_limit, riderId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.json({ success: true, rider: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Record cash deposit from rider (admin)
const recordDeposit = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { riderId } = req.params;
    const { amount, notes } = req.body;
    const admin_id = req.user.id;

    const riderResult = await client.query(
      'SELECT * FROM riders WHERE id=$1 AND is_active=TRUE', [riderId]
    );
    if (!riderResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    const rider = riderResult.rows[0];
    if (parseFloat(amount) > parseFloat(rider.current_cash)) {
      return res.status(400).json({ success: false, message: 'Deposit amount exceeds current cash in hand' });
    }

    await client.query(
      `INSERT INTO rider_deposits (rider_id, amount, received_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [riderId, amount, admin_id, notes || null]
    );
    await client.query(
      'UPDATE riders SET current_cash = current_cash - $1, updated_at=NOW() WHERE id=$2',
      [amount, riderId]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Deposit recorded successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

// Get rider's own profile & earnings (rider)
const getRiderProfile = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const rider = await pool.query(
      `SELECT id, name, phone, status, current_cash, cod_limit, total_earnings, created_at
       FROM riders WHERE id=$1`, [rider_id]
    );
    if (!rider.rows.length) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    // Today's earnings summary
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await pool.query(
      `SELECT COUNT(*) AS delivered_today, COALESCE(SUM(delivery_charge), 0) AS earned_today
       FROM orders
       WHERE rider_id=$1 AND status='delivered' AND DATE(delivered_at)=$2 AND is_deleted=FALSE`,
      [rider_id, today]
    );

    // Deposit history
    const deposits = await pool.query(
      'SELECT amount, notes, created_at FROM rider_deposits WHERE rider_id=$1 ORDER BY created_at DESC LIMIT 10',
      [rider_id]
    );

    res.json({
      success: true,
      rider: rider.rows[0],
      today_stats: todayStats.rows[0],
      recent_deposits: deposits.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle rider online/offline status (rider)
const toggleStatus = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const result = await pool.query(
      `UPDATE riders SET
        status = CASE WHEN status='online' THEN 'offline' ELSE 'online' END,
        updated_at = NOW()
       WHERE id=$1 RETURNING status`,
      [rider_id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.json({ success: true, status: result.rows[0].status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllRiders, createRider, updateRider, recordDeposit, getRiderProfile, toggleStatus };