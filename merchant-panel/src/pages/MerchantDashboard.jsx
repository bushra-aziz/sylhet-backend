import { useState, useEffect } from 'react';
import { timeAgo, apiCall } from '../utils';

function MBadge({ status }) {
  const map = {
    pending:       ['rgba(251,191,36,.15)','#fbbf24'],
    delivered:     ['rgba(52,211,153,.15)','#34d399'],
    assigned:      ['rgba(96,165,250,.15)','#60a5fa'],
    picked_up:     ['rgba(167,139,250,.15)','#a78bfa'],
    out_for_delivery:['rgba(96,165,250,.15)','#60a5fa'],
    failed:        ['rgba(248,113,113,.15)','#f87171'],
    returned:      ['rgba(251,191,36,.15)','#fbbf24'],
    cancelled:     ['rgba(248,113,113,.15)','#f87171'],
  };
  const [bg, c] = map[status] || ['rgba(148,163,184,.15)', '#94a3b8'];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:bg, color:c, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, border:`1px solid ${c}22` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c }} />
      {status.replace(/_/g,' ')}
    </span>
  );
}

export default function MerchantDashboard({ token, user, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiCall('/orders/merchant/my', token);
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total:      orders.length,
    delivered:  orders.filter(o => o.status === 'delivered').length,
    inProgress: orders.filter(o => ['assigned','picked_up','out_for_delivery'].includes(o.status)).length,
    pending:    orders.filter(o => o.status === 'pending').length,
  };

  const balance = user?.balance != null ? Number(user.balance) : null;

  // ── Stat card ──────────────────────────────────────────────
  const StatCard = ({ label, value, sub, accent }) => (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 16,
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at top left, ${accent}18 0%, transparent 65%)`, pointerEvents:'none' }} />
      <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:700, color: accent, letterSpacing:'-1.5px', fontFamily:'DM Mono, monospace', marginBottom:4 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ padding: 28 }}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:14, marginBottom:28 }}>
        <StatCard label="Total Orders"  value={stats.total}                                                   sub="All time"         accent="#60a5fa" />
        <StatCard label="Delivered"     value={stats.delivered}                                               sub="Completed"        accent="#34d399" />
        <StatCard label="In Progress"   value={stats.inProgress}                                              sub="Active"           accent="#a78bfa" />
        <StatCard label="Balance Due"   value={balance !== null ? '৳' + balance.toLocaleString() : null}      sub="Pending payout"   accent="#fbbf24" />
      </div>

      {/* Recent orders table */}
      <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, overflow:'hidden' }}>

        {/* Table header */}
        <div style={{ display:'flex', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9' }}>Recent Orders</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.3)', marginTop:2 }}>Your latest parcels</div>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            style={{
              marginLeft:'auto', background:'linear-gradient(135deg,#3b82f6,#6366f1)',
              color:'#fff', border:'none', borderRadius:9, padding:'8px 18px',
              fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(99,102,241,.3)',
            }}
          >
            View All →
          </button>
        </div>

        {/* Table body */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(255,255,255,.25)', fontSize:14 }}>
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,.25)' }}>No orders yet</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Tracking ID','Customer','Zone','Rider','COD','Charge','Status','Date'].map(h => (
                    <th key={h} style={{
                      textAlign:'left', padding:'11px 20px', fontSize:11, fontWeight:700,
                      color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em',
                      borderBottom:'1px solid rgba(255,255,255,.07)', background:'rgba(255,255,255,.02)',
                      whiteSpace:'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ borderBottom:'1px solid rgba(255,255,255,.05)', transition:'background .15s' }}
                  >
                    <td style={{ padding:'13px 20px' }}>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'#60a5fa', fontWeight:600 }}>{o.tracking_id}</span>
                    </td>
                    <td style={{ padding:'13px 20px' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9' }}>{o.customer_name}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.3)' }}>{o.customer_phone}</div>
                    </td>
                    <td style={{ padding:'13px 20px', fontSize:13, color:'rgba(255,255,255,.5)' }}>{o.zone_name || '—'}</td>
                    <td style={{ padding:'13px 20px', fontSize:13, color: o.rider_name ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)' }}>{o.rider_name || 'Pending'}</td>
                    <td style={{ padding:'13px 20px', fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#fbbf24' }}>৳{Number(o.cod_amount || 0).toLocaleString()}</td>
                    <td style={{ padding:'13px 20px', fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#34d399' }}>৳{Number(o.delivery_charge || 0).toLocaleString()}</td>
                    <td style={{ padding:'13px 20px' }}><MBadge status={o.status} /></td>
                    <td style={{ padding:'13px 20px', fontSize:12, color:'rgba(255,255,255,.3)' }}>{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}