// ============================================================
// AdminDashboard.jsx — Fixed: Real backend data, no silent demo fallback
// Copy to: admin-panel/src/pages/AdminDashboard.jsx
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '../components/UI';
import { timeAgo, apiCall, API_BASE } from '../utils';

function StatCard({ label, value, sub, accent, icon, loading }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 16, padding: '22px 22px 18px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
        <i className={`ti ${icon}`} style={{ fontSize: 20, color: accent, opacity: 0.8 }} aria-hidden="true" />
      </div>
      {loading ? (
        <div style={{ height: 38, margin: '8px 0 4px', background: 'rgba(255,255,255,.06)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
      ) : (
        <div style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', margin: '8px 0 4px', letterSpacing: '-1px', fontFamily: 'DM Mono,monospace' }}>{value}</div>
      )}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{sub}</div>
    </div>
  );
}

export default function AdminDashboard({ token, onNavigate }) {
  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const loadStats = useCallback(async () => {
    try {
      const data = await apiCall('/orders/dashboard/stats', token);
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Stats load failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Cannot connect to backend. Make sure server is running on port 5000.');
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiCall('/orders?limit=10', token);
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }
  }, [token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    await Promise.all([loadStats(), loadOrders()]);
    setLoading(false);
  }, [loadStats, loadOrders]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const cashAlert = stats && stats.total_cash_in_hand > 50000;

  return (
    <div style={{ padding: 28 }}>

      {/* ── Backend connection error ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
        }}>
          <i className="ti ti-plug-off" style={{ fontSize: 20, color: '#f87171', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>Backend Connection Error</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>{error}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: 'DM Mono,monospace' }}>
              Run: <span style={{ color: '#93c5fd' }}>cd backend && npm start</span>
              &nbsp;&nbsp;→&nbsp;&nbsp;
              Check: <span style={{ color: '#93c5fd' }}>{API_BASE}/orders/dashboard/stats</span>
            </div>
          </div>
          <button onClick={loadAll} style={{
            marginLeft: 'auto', flexShrink: 0,
            background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
            color: '#f87171', borderRadius: 8, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="ti ti-refresh" style={{ fontSize: 14 }} aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      {/* ── High cash alert ── */}
      {cashAlert && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontSize: 13,
        }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 18, color: '#fbbf24', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ color: '#fbbf24', fontWeight: 600 }}>৳{stats.total_cash_in_hand.toLocaleString()} uncollected COD</span>
          <span style={{ color: 'rgba(255,255,255,.5)' }}> — Riders are nearing cash limits. Collect soon.</span>
          <button onClick={() => onNavigate('finance')} style={{
            marginLeft: 'auto', background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)',
            color: '#fbbf24', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Go to Finance <i className="ti ti-arrow-right" style={{ fontSize: 13 }} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard loading={loading} label="Today's Orders"     value={stats?.today_total ?? '—'}                                              sub="All statuses"        accent="#3b82f6" icon="ti-package" />
        <StatCard loading={loading} label="Delivered"          value={stats?.today_delivered ?? '—'}                                          sub="Completed today"     accent="#10b981" icon="ti-circle-check" />
        <StatCard loading={loading} label="Pending"            value={stats?.today_pending ?? '—'}                                            sub="Awaiting assignment" accent="#f59e0b" icon="ti-clock-hour-4" />
        <StatCard loading={loading} label="Failed / Cancelled" value={stats ? (stats.today_failed || 0) + (stats.today_cancelled || 0) : '—'} sub="Today"              accent="#ef4444" icon="ti-circle-x" />
        <StatCard loading={loading} label="Active Riders"      value={stats?.active_riders ?? '—'}                                            sub="Currently online"    accent="#a78bfa" icon="ti-motorbike" />
        <StatCard loading={loading} label="Cash In Hand"       value={stats ? '৳' + Number(stats.total_cash_in_hand).toLocaleString() : '—'} sub="Across all riders"  accent="#f59e0b" icon="ti-cash" />
      </div>

      {/* ── Recent Orders table ── */}
      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Recent Orders</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              {loading ? 'Loading from database…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} from database`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={loadAll} style={{
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.4)', borderRadius: 9, padding: '7px 14px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <i className="ti ti-refresh" style={{ fontSize: 13 }} aria-hidden="true" /> Refresh
            </button>
            <button onClick={() => onNavigate('orders')} style={{
              background: 'rgba(59,130,246,.2)', border: '1px solid rgba(59,130,246,.3)',
              color: '#93c5fd', borderRadius: 9, padding: '7px 16px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              View All <i className="ti ti-arrow-right" style={{ fontSize: 13 }} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: 24 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 44, background: 'rgba(255,255,255,.04)', borderRadius: 8,
                marginBottom: 8, opacity: 1 - i * 0.15,
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className="ti ti-inbox" style={{ fontSize: 40, color: 'rgba(255,255,255,.15)', display: 'block', marginBottom: 12 }} aria-hidden="true" />
            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 14, marginBottom: 6 }}>No orders yet</div>
            <div style={{ color: 'rgba(255,255,255,.2)', fontSize: 12 }}>Orders will appear here once merchants start placing them</div>
          </div>
        )}

        {/* Orders table */}
        {!loading && orders.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tracking ID', 'Customer', 'Merchant', 'Zone', 'COD Amount', 'Status', 'Time'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '11px 20px', fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.06em',
                      borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(0,0,0,.2)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id || i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#60a5fa' }}>{o.tracking_id}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{o.customer_phone}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{o.merchant_name || '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{o.zone_name || '—'}</td>
                    <td style={{ padding: '14px 20px', fontFamily: 'DM Mono,monospace', fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                      ৳{Number(o.cod_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}