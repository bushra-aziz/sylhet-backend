const pool = require('../config/db');

// Create order (merchant)
const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      customer_name, customer_phone, customer_address,
      zone_id, product_type, weight_kg, cod_amount, delivery_notes
    } = req.body;
    const merchant_id = req.user.id;

    // Get delivery charge (merchant custom rate or zone base rate)
    const rateResult = await client.query(
      `SELECT COALESCE(m.custom_delivery_rate, z.base_delivery_rate) AS charge
       FROM merchants m, zones z
       WHERE m.id=$1 AND z.id=$2`, [merchant_id, zone_id]
    );
    const delivery_charge = rateResult.rows[0]?.charge || 60;

    // Generate tracking ID
    const trackResult = await client.query('SELECT generate_tracking_id() AS tracking_id');
    const tracking_id = trackResult.rows[0].tracking_id;

    const result = await client.query(
      `INSERT INTO orders
        (tracking_id, merchant_id, zone_id, customer_name, customer_phone,
         customer_address, product_type, weight_kg, cod_amount, delivery_charge, delivery_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [tracking_id, merchant_id, zone_id, customer_name, customer_phone,
       customer_address, product_type, weight_kg||0, cod_amount||0, delivery_charge, delivery_notes||null]
    );
    const order = result.rows[0];

    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by_type, changed_by_id)
       VALUES ($1,'pending','merchant',$2)`, [order.id, merchant_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create order', error: err.message });
  } finally {
    client.release();
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, merchant_id, rider_id, date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE o.is_deleted = FALSE';
    const params = [];
    let i = 1;
    if (status) { whereClause += ` AND o.status=$${i++}`; params.push(status); }
    if (merchant_id) { whereClause += ` AND o.merchant_id=$${i++}`; params.push(merchant_id); }
    if (rider_id) { whereClause += ` AND o.rider_id=$${i++}`; params.push(rider_id); }
    if (date) { whereClause += ` AND DATE(o.created_at)=$${i++}`; params.push(date); }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders o ${whereClause}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT o.*,
              m.business_name AS merchant_name, m.phone AS merchant_phone,
              r.name AS rider_name, r.phone AS rider_phone,
              z.name AS zone_name
       FROM orders o
       LEFT JOIN merchants m ON o.merchant_id = m.id
       LEFT JOIN riders r ON o.rider_id = r.id
       LEFT JOIN zones z ON o.zone_id = z.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`, params
    );
    res.json({ success: true, orders: result.rows, total, page: +page, limit: +limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get orders for merchant
const getMerchantOrders = async (req, res) => {
  try {
    const merchant_id = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE o.merchant_id=$1 AND o.is_deleted=FALSE';
    const params = [merchant_id];
    if (status) { where += ` AND o.status=$2`; params.push(status); }
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT o.*, r.name AS rider_name, z.name AS zone_name
       FROM orders o
       LEFT JOIN riders r ON o.rider_id = r.id
       LEFT JOIN zones z ON o.zone_id = z.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length-1} OFFSET $${params.length}`, params
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get orders for rider
const getRiderOrders = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const result = await pool.query(
      `SELECT o.*, m.business_name AS merchant_name, m.phone AS merchant_phone, z.name AS zone_name
       FROM orders o
       LEFT JOIN merchants m ON o.merchant_id = m.id
       LEFT JOIN zones z ON o.zone_id = z.id
       WHERE o.rider_id=$1 AND o.is_deleted=FALSE
         AND o.status IN ('assigned','picked_up','out_for_delivery')
       ORDER BY o.created_at DESC`, [rider_id]
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Assign rider to order (admin)
const assignRider = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { orderId } = req.params;
    const { rider_id } = req.body;

    // Check rider is active and not over COD limit
    const riderResult = await client.query(
      'SELECT * FROM riders WHERE id=$1 AND is_active=TRUE', [rider_id]
    );
    if (!riderResult.rows.length) {
      return res.status(400).json({ success: false, message: 'Rider not found or inactive' });
    }
    const rider = riderResult.rows[0];
    const order = await client.query(
      'SELECT * FROM orders WHERE id=$1 AND is_deleted=FALSE', [orderId]
    );
    if (!order.rows.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const newCash = parseFloat(rider.current_cash) + parseFloat(order.rows[0].cod_amount);
    if (newCash > parseFloat(rider.cod_limit)) {
      return res.status(400).json({
        success: false,
        message: `Rider COD limit exceeded. Current: ৳${rider.current_cash}, Limit: ৳${rider.cod_limit}`
      });
    }

    await client.query(
      'UPDATE orders SET rider_id=$1, status=$2, updated_at=NOW() WHERE id=$3',
      [rider_id, 'assigned', orderId]
    );
    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by_type, changed_by_id)
       VALUES ($1,'assigned','admin',$2)`, [orderId, req.user.id]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Rider assigned successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

// Update order status (rider)
const updateOrderStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { orderId } = req.params;
    const { status, collected_cash, failure_reason } = req.body;
    const rider_id = req.user.id;

    const validTransitions = {
      assigned: ['picked_up'],
      picked_up: ['out_for_delivery'],
      out_for_delivery: ['delivered', 'failed', 'returned']
    };

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id=$1 AND rider_id=$2 AND is_deleted=FALSE', [orderId, rider_id]
    );
    if (!orderResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = orderResult.rows[0];
    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change status from ${order.status} to ${status}` });
    }

    const updates = { status, updated_at: 'NOW()' };
    if (status === 'delivered') {
      await client.query(
        'UPDATE riders SET current_cash = current_cash + $1, total_earnings = total_earnings + $2 WHERE id=$3',
        [collected_cash || order.cod_amount, order.delivery_charge, rider_id]
      );
      await client.query(
        'UPDATE orders SET status=$1, delivered_at=NOW(), updated_at=NOW() WHERE id=$2',
        [status, orderId]
      );
    } else if (status === 'picked_up') {
      await client.query(
        'UPDATE orders SET status=$1, picked_up_at=NOW(), updated_at=NOW() WHERE id=$2',
        [status, orderId]
      );
    } else {
      await client.query(
        'UPDATE orders SET status=$1, failure_reason=$2, updated_at=NOW() WHERE id=$3',
        [status, failure_reason || null, orderId]
      );
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by_type, changed_by_id, notes)
       VALUES ($1,$2,'rider',$3,$4)`, [orderId, status, rider_id, failure_reason || null]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

// Get order by tracking ID (public)
const trackOrder = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await pool.query(
      `SELECT o.tracking_id, o.status, o.customer_name, o.customer_address,
              o.created_at, o.delivered_at, o.picked_up_at,
              m.business_name AS merchant_name,
              z.name AS zone_name,
              r.name AS rider_name
       FROM orders o
       LEFT JOIN merchants m ON o.merchant_id = m.id
       LEFT JOIN zones z ON o.zone_id = z.id
       LEFT JOIN riders r ON o.rider_id = r.id
       WHERE o.tracking_id=$1 AND o.is_deleted=FALSE`, [trackingId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const history = await pool.query(
      'SELECT status, created_at FROM order_status_history WHERE order_id=(SELECT id FROM orders WHERE tracking_id=$1) ORDER BY created_at ASC',
      [trackingId]
    );
    res.json({ success: true, order: result.rows[0], history: history.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Dashboard stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [totalToday, delivered, cancelled, pending, returned, activeriders, cashInHand] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM orders WHERE DATE(created_at)=$1 AND is_deleted=FALSE', [today]),
      pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at)=$1 AND status='delivered' AND is_deleted=FALSE", [today]),
      pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at)=$1 AND status='cancelled' AND is_deleted=FALSE", [today]),
      pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at)=$1 AND status='pending' AND is_deleted=FALSE", [today]),
      pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at)=$1 AND status='returned' AND is_deleted=FALSE", [today]),
      pool.query("SELECT COUNT(*) FROM riders WHERE status='online' AND is_active=TRUE"),
      pool.query('SELECT COALESCE(SUM(current_cash),0) AS total FROM riders WHERE is_active=TRUE'),
    ]);
    res.json({
      success: true,
      stats: {
        today_total: +totalToday.rows[0].count,
        today_delivered: +delivered.rows[0].count,
        today_cancelled: +cancelled.rows[0].count,
        today_pending: +pending.rows[0].count,
        today_returned: +returned.rows[0].count,
        active_riders: +activeriders.rows[0].count,
        total_cash_in_hand: +cashInHand.rows[0].total,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createOrder, getAllOrders, getMerchantOrders, getRiderOrders,
  assignRider, updateOrderStatus, trackOrder, getDashboardStats
};