// ============================================================
// utils.js  —  Sylhet Courier Admin Panel
// Copy this file to:  admin-panel/src/utils.js
// ============================================================

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── API helper ───────────────────────────────────────────────
export async function apiCall(endpoint, token, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && token !== 'demo' ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  return res.json();
}

// ── Time helper ──────────────────────────────────────────────
export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Demo Zones ───────────────────────────────────────────────
export const ZONES = [
  { id: 'z1', name: 'Zindabazar',    base_delivery_rate: 60 },
  { id: 'z2', name: 'Shibgonj',      base_delivery_rate: 60 },
  { id: 'z3', name: 'Upashahar',     base_delivery_rate: 70 },
  { id: 'z4', name: 'Amberkhana',    base_delivery_rate: 70 },
  { id: 'z5', name: 'Bondor',        base_delivery_rate: 80 },
  { id: 'z6', name: 'Mirer Moidan',  base_delivery_rate: 75 },
  { id: 'z7', name: 'Shahjalal',     base_delivery_rate: 80 },
  { id: 'z8', name: 'Tilagor',       base_delivery_rate: 85 },
];

// ── Demo Riders ──────────────────────────────────────────────
export const DEMO_RIDERS = [
  { id: 'r1', name: 'Karim Uddin',   phone: '01711-111111', nid_number: '19901234567', vehicle_type: 'motorcycle', zone_id: 'z1', zone_name: 'Zindabazar',  status: 'online',   current_cash: 8500,  cod_limit: 10000, total_earnings: 4200 },
  { id: 'r2', name: 'Rahim Mia',     phone: '01722-222222', nid_number: '19901234568', vehicle_type: 'motorcycle', zone_id: 'z2', zone_name: 'Shibgonj',    status: 'online',   current_cash: 3200,  cod_limit: 10000, total_earnings: 6800 },
  { id: 'r3', name: 'Jalal Ahmed',   phone: '01733-333333', nid_number: '19901234569', vehicle_type: 'bicycle',    zone_id: 'z3', zone_name: 'Upashahar',   status: 'offline',  current_cash: 0,     cod_limit: 8000,  total_earnings: 2100 },
  { id: 'r4', name: 'Sumon Khan',    phone: '01744-444444', nid_number: '19901234570', vehicle_type: 'motorcycle', zone_id: 'z4', zone_name: 'Amberkhana',  status: 'online',   current_cash: 6700,  cod_limit: 10000, total_earnings: 9500 },
  { id: 'r5', name: 'Nayan Mia',     phone: '01755-555555', nid_number: '19901234571', vehicle_type: 'auto',       zone_id: 'z5', zone_name: 'Bondor',      status: 'suspended',current_cash: 0,     cod_limit: 5000,  total_earnings: 1200 },
];

// ── Demo Merchants ───────────────────────────────────────────
export const DEMO_MERCHANTS = [
  { id: 'm1', business_name: 'Sylhet Fashion House', owner_name: 'Farida Begum',  phone: '01811-111111', email: 'farida@gmail.com',  status: 'active',    balance: 12400, custom_delivery_rate: null, total_orders: 87,  address: 'Zindabazar, Sylhet' },
  { id: 'm2', business_name: 'Bondhu Bakery',         owner_name: 'Rashed Karim',  phone: '01822-222222', email: '',                  status: 'active',    balance: 5800,  custom_delivery_rate: 55,   total_orders: 43,  address: 'Amberkhana, Sylhet' },
  { id: 'm3', business_name: 'Digital Store BD',      owner_name: 'Shakil Ahmed',  phone: '01833-333333', email: 'shakil@gmail.com',  status: 'active',    balance: 31000, custom_delivery_rate: 50,   total_orders: 214, address: 'Upashahar, Sylhet' },
  { id: 'm4', business_name: 'Sylhet Crafts',         owner_name: 'Mitu Akter',    phone: '01844-444444', email: '',                  status: 'suspended', balance: 0,     custom_delivery_rate: null, total_orders: 12,  address: 'Shibgonj, Sylhet' },
];

// ── Demo Orders ──────────────────────────────────────────────
export const DEMO_ORDERS = [
  { id: 'o1',  tracking_id: 'SYL-001234', customer_name: 'Anika Rahman',   customer_phone: '01900-111111', merchant_name: 'Sylhet Fashion House', rider_name: 'Karim Uddin', zone_name: 'Zindabazar',  cod_amount: 850,  delivery_charge: 60, status: 'delivered',        created_at: new Date(Date.now()-3600000).toISOString() },
  { id: 'o2',  tracking_id: 'SYL-001235', customer_name: 'Babul Hossain',  customer_phone: '01900-222222', merchant_name: 'Bondhu Bakery',        rider_name: 'Rahim Mia',   zone_name: 'Amberkhana',  cod_amount: 400,  delivery_charge: 55, status: 'out_for_delivery', created_at: new Date(Date.now()-1800000).toISOString() },
  { id: 'o3',  tracking_id: 'SYL-001236', customer_name: 'Champa Khanam',  customer_phone: '01900-333333', merchant_name: 'Digital Store BD',     rider_name: null,          zone_name: 'Upashahar',   cod_amount: 1200, delivery_charge: 50, status: 'pending',          created_at: new Date(Date.now()-900000).toISOString() },
  { id: 'o4',  tracking_id: 'SYL-001237', customer_name: 'Delwar Mia',     customer_phone: '01900-444444', merchant_name: 'Sylhet Fashion House', rider_name: 'Sumon Khan',  zone_name: 'Amberkhana',  cod_amount: 650,  delivery_charge: 60, status: 'picked_up',        created_at: new Date(Date.now()-600000).toISOString() },
  { id: 'o5',  tracking_id: 'SYL-001238', customer_name: 'Emon Ahmed',     customer_phone: '01900-555555', merchant_name: 'Digital Store BD',     rider_name: 'Karim Uddin', zone_name: 'Zindabazar',  cod_amount: 2200, delivery_charge: 50, status: 'assigned',         created_at: new Date(Date.now()-300000).toISOString() },
  { id: 'o6',  tracking_id: 'SYL-001239', customer_name: 'Fatema Begum',   customer_phone: '01900-666666', merchant_name: 'Bondhu Bakery',        rider_name: 'Rahim Mia',   zone_name: 'Shibgonj',    cod_amount: 350,  delivery_charge: 55, status: 'delivered',        created_at: new Date(Date.now()-7200000).toISOString() },
  { id: 'o7',  tracking_id: 'SYL-001240', customer_name: 'Golam Mustafa',  customer_phone: '01900-777777', merchant_name: 'Sylhet Crafts',        rider_name: null,          zone_name: 'Bondor',      cod_amount: 780,  delivery_charge: 80, status: 'pending',          created_at: new Date(Date.now()-120000).toISOString() },
  { id: 'o8',  tracking_id: 'SYL-001241', customer_name: 'Hena Akter',     customer_phone: '01900-888888', merchant_name: 'Digital Store BD',     rider_name: 'Sumon Khan',  zone_name: 'Upashahar',   cod_amount: 1500, delivery_charge: 50, status: 'failed',           created_at: new Date(Date.now()-5400000).toISOString() },
  { id: 'o9',  tracking_id: 'SYL-001242', customer_name: 'Imran Hossain',  customer_phone: '01900-999999', merchant_name: 'Sylhet Fashion House', rider_name: 'Karim Uddin', zone_name: 'Amberkhana',  cod_amount: 950,  delivery_charge: 60, status: 'returned',         created_at: new Date(Date.now()-10800000).toISOString() },
  { id: 'o10', tracking_id: 'SYL-001243', customer_name: 'Jasmine Khanam', customer_phone: '01900-100000', merchant_name: 'Bondhu Bakery',        rider_name: null,          zone_name: 'Mirer Moidan',cod_amount: 600,  delivery_charge: 75, status: 'pending',          created_at: new Date(Date.now()-60000).toISOString() },
];