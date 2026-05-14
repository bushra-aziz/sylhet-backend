// ============================================================
// AdminOrders.jsx — Fixed: Real backend data only
// Copy to: admin-panel/src/pages/AdminOrders.jsx
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Badge, useToast, Toast } from '../components/UI';
import { timeAgo, apiCall } from '../utils';

export default function AdminOrders({ token }) {
  const [orders, setOrders]           = useState([]);
  const [riders, setRiders]           = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedRider, setSelectedRider] = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [toast, showToast]            = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall(`/orders${statusFilter ? '?status=' + statusFilter : ''}`, token);
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to load orders');
        setOrders([]);
      }
    } catch (err) {
      setError('Cannot connect to backend. Make sure server is running on port 5000.');
      setOrders([]);
    }
    setLoading(false);
  }, [statusFilter, token]);

  const loadRiders = useCallback(async () => {
    try {
      const data = await apiCall('/riders', token);
      if (data.success) setRiders(data.riders || []);
    } catch {
      setRiders([]);
    }
  }, [token]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { loadRiders(); }, [loadRiders]);

  async function submitAssign() {
    if (!selectedRider) { showToast('Please select a rider', 'error'); return; }
    try {
      const data = await apiCall(`/orders/${assignModal.orderId}/assign`, token, {
        method: 'PUT',
        body: JSON.stringify({ rider_id: selectedRider }),
      });
      if (data.success) {
        showToast('Rider assigned successfully!', 'success');
        setAssignModal(null);
        loadOrders();
      } else {
        showToast(data.message || 'Assignment failed', 'error');
      }
    } catch {
      showToast('Cannot connect to backend', 'error');
    }
  }

  const statuses = ['', 'pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed', 'returned'];

  return (
    <div style={{ padding: 28 }}>
      <Toast {...toast} />

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 20,
        }}>
          <span style={{ fontSize: 18 }}>🔌</span>
          <span style={{ fontSize: 13, color: '#f87171' }}>{error}</span>
          <button onClick={loadOrders} style={{
            marginLeft: 'auto', background: 'rgba(239,68,68,.15)',
            border: '1px solid rgba(239,68,68,.3)', color: '#f87171',
            borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>↻ Retry</button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: statusFilter === s ? 'rgba(59,130,246,.25)' : 'rgba(255,255,255,.05)',
            border: statusFilter === s ? '1px solid rgba(59,130,246,.4)' : '1px solid rgba(255,255,255,.08)',
            color: statusFilter === s ? '#93c5fd' : 'rgba(255,255,255,.4)',
          }}>{s || 'All Statuses'}</button>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>All Orders</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              {loading ? 'Loading from database…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} from database`}
            </div>
          </div>
          <button onClick={loadOrders} style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)',
            borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>↻ Refresh</button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: 44, background: 'rgba(255,255,255,.04)', borderRadius: 8,
                marginBottom: 8, opacity: 1 - i * 0.12,
                animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>No orders found</div>
            <div style={{ color: 'rgba(255,255,255,.2)', fontSize: 12, marginTop: 4 }}>
              {statusFilter ? `No orders with status "${statusFilter}"` : 'No orders in database yet'}
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && orders.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tracking ID', 'Customer', 'Merchant', 'Rider', 'Zone', 'COD', 'Charge', 'Status', 'Time', 'Action'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '11px 18px', fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.06em',
                      borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(0,0,0,.2)', whiteSpace: 'nowrap',
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
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#60a5fa' }}>{o.tracking_id}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{o.customer_phone}</div>
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{o.merchant_name || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: o.rider_name ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.25)' }}>
                      {o.rider_name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{o.zone_name || '—'}</td>
                    <td style={{ padding: '13px 18px', fontFamily: 'DM Mono,monospace', fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                      ৳{Number(o.cod_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 18px', fontFamily: 'DM Mono,monospace', fontSize: 13, fontWeight: 600, color: '#34d399' }}>
                      ৳{Number(o.delivery_charge || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 18px' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '13px 18px', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{timeAgo(o.created_at)}</td>
                    <td style={{ padding: '13px 18px' }}>
                      {o.status === 'pending' ? (
                        <button onClick={() => { setAssignModal({ orderId: o.id, trackingId: o.tracking_id }); setSelectedRider(''); }}
                          style={{
                            background: 'rgba(59,130,246,.2)', border: '1px solid rgba(59,130,246,.4)',
                            color: '#93c5fd', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}>Assign →</button>
                      ) : <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div onClick={() => setAssignModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#13161e', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 20, padding: 32, width: 440, maxWidth: '100%',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Assign Rider</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 24 }}>
              Order: <span style={{ color: '#60a5fa', fontFamily: 'DM Mono,monospace' }}>{assignModal.trackingId}</span>
            </div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Select Rider
            </label>
            <select value={selectedRider} onChange={e => setSelectedRider(e.target.value)}
              style={{ width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.12)', borderRadius: 10, fontSize: 13, color: '#f1f5f9', outline: 'none', marginBottom: 24 }}>
              <option value="">Choose available rider…</option>
              {riders.filter(r => r.status === 'online').map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — ৳{Number(r.current_cash || 0).toLocaleString()} / ৳{Number(r.cod_limit || 0).toLocaleString()} cash
                </option>
              ))}
            </select>
            {riders.filter(r => r.status === 'online').length === 0 && (
              <div style={{ fontSize: 12, color: '#f87171', marginBottom: 16, padding: '8px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 8 }}>
                ⚠️ No online riders available right now
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setAssignModal(null)} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button onClick={submitAssign} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Assign Rider</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}