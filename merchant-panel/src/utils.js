
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Generic API helper ────────────────────────
export async function apiCall(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ── Date helpers ──────────────────────────────
export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Zones (Sylhet) ────────────────────────────
export const ZONES = [
  { id: '1', name: 'Zindabazar',    base_delivery_rate: 60  },
  { id: '2', name: 'Amberkhana',    base_delivery_rate: 60  },
  { id: '3', name: 'Upashahar',     base_delivery_rate: 70  },
  { id: '4', name: 'Shibgonj',      base_delivery_rate: 65  },
  { id: '5', name: 'Bondor',        base_delivery_rate: 75  },
  { id: '6', name: 'Shahporan',     base_delivery_rate: 80  },
  { id: '7', name: 'Mirer Moidan',  base_delivery_rate: 70  },
  { id: '8', name: 'Akhalia',       base_delivery_rate: 85  },
  { id: '9', name: 'Tilagor',       base_delivery_rate: 80  },
  { id:'10', name: 'Kumarpara',     base_delivery_rate: 65  },
];

// ── Demo Orders (fallback when API is offline) ─
const now = new Date();
const ago = (h) => new Date(now - h * 3600000).toISOString();

export const DEMO_ORDERS = [
  { tracking_id:'SYL1001', customer_name:'Nurun Nahar',    customer_phone:'01711111111', zone_name:'Zindabazar',   rider_name:'Karim',   cod_amount:850,  delivery_charge:60, status:'delivered',        created_at: ago(2)  },
  { tracking_id:'SYL1002', customer_name:'Rashed Hossain', customer_phone:'01722222222', zone_name:'Upashahar',    rider_name:'Rahim',   cod_amount:1200, delivery_charge:70, status:'out_for_delivery', created_at: ago(5)  },
  { tracking_id:'SYL1003', customer_name:'Sabrina Islam',  customer_phone:'01733333333', zone_name:'Amberkhana',   rider_name:null,      cod_amount:550,  delivery_charge:60, status:'pending',          created_at: ago(8)  },
  { tracking_id:'SYL1004', customer_name:'Tanvir Ahmed',   customer_phone:'01744444444', zone_name:'Shibgonj',     rider_name:'Jamal',   cod_amount:2200, delivery_charge:65, status:'assigned',         created_at: ago(10) },
  { tracking_id:'SYL1005', customer_name:'Mitu Begum',     customer_phone:'01755555555', zone_name:'Bondor',       rider_name:'Karim',   cod_amount:400,  delivery_charge:75, status:'picked_up',        created_at: ago(14) },
  { tracking_id:'SYL1006', customer_name:'Fahim Uddin',    customer_phone:'01766666666', zone_name:'Shahporan',    rider_name:'Sumon',   cod_amount:980,  delivery_charge:80, status:'delivered',        created_at: ago(26) },
  { tracking_id:'SYL1007', customer_name:'Parvin Akter',   customer_phone:'01777777777', zone_name:'Mirer Moidan', rider_name:null,      cod_amount:700,  delivery_charge:70, status:'returned',         created_at: ago(30) },
  { tracking_id:'SYL1008', customer_name:'Monir Hossain',  customer_phone:'01788888888', zone_name:'Akhalia',      rider_name:'Rahim',   cod_amount:1500, delivery_charge:85, status:'delivered',        created_at: ago(48) },
  { tracking_id:'SYL1009', customer_name:'Sadia Rahman',   customer_phone:'01799999999', zone_name:'Tilagor',      rider_name:'Jamal',   cod_amount:330,  delivery_charge:80, status:'cancelled',        created_at: ago(52) },
  { tracking_id:'SYL1010', customer_name:'Babul Mia',      customer_phone:'01811111111', zone_name:'Kumarpara',    rider_name:'Sumon',   cod_amount:1800, delivery_charge:65, status:'delivered',        created_at: ago(72) },
];

// ── Smart Paste Parser ────────────────────────
// Parses raw text copied from Facebook / WhatsApp messages
// Handles common Bengali-style formats like:
//   নাম: Nurun Nahar  /  Name: ...
//   ফোন: 01711...     /  Phone: ...
//   ঠিকানা: ...        /  Address: ...
export function parsePasteText(raw) {
  const text = raw || '';
  const result = { name: '', phone: '', address: '' };

  // ── Phone (any Bangladeshi number: 01X-XXXXXXXX) ──
  const phoneMatch = text.match(/(?:phone|mobile|ফোন|নম্বর|call|mob)[^\d]*(\+?8801[3-9]\d{8}|01[3-9]\d{8})/i)
    || text.match(/(\+?8801[3-9]\d{8}|01[3-9]\d{8})/);
  if (phoneMatch) result.phone = phoneMatch[1].replace(/^\+?880/, '0');

  // ── Name ──
  const nameMatch = text.match(/(?:name|নাম|customer)[^\n:：]*[:：]\s*([^\n,]+)/i);
  if (nameMatch) result.name = nameMatch[1].trim();

  // ── Address ──
  const addrMatch = text.match(/(?:address|ঠিকানা|addr|location|delivery)[^\n:：]*[:：]\s*([^\n]+)/i);
  if (addrMatch) result.address = addrMatch[1].trim();

  // ── Fallback: first line as name if nothing found ──
  if (!result.name) {
    const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 2 && !/\d{6,}/.test(l));
    if (firstLine) result.name = firstLine.replace(/^(name|নাম)[:：\s]*/i, '').trim();
  }

  return result;
}