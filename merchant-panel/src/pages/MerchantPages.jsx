import { useState, useEffect, useCallback } from 'react';
import { fmtDate, apiCall } from '../utils';

function MBadge({ status }) {
  const map = {
    pending: ['rgba(251,191,36,.15)', '#fbbf24'],
    delivered: ['rgba(52,211,153,.15)', '#34d399'],
    assigned: ['rgba(96,165,250,.15)', '#60a5fa'],
    picked_up: ['rgba(167,139,250,.15)', '#a78bfa'],
    out_for_delivery: ['rgba(96,165,250,.15)', '#60a5fa'],
    failed: ['rgba(248,113,113,.15)', '#f87171'],
    returned: ['rgba(251,191,36,.15)', '#fbbf24'],
    cancelled: ['rgba(248,113,113,.15)', '#f87171'],
  };

  const [bg, c] =
    map[status] || [
      'rgba(148,163,184,.15)',
      '#94a3b8',
    ];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: bg,
        color: c,
        padding: '4px 11px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        border: `1px solid ${c}22`,
        textTransform: 'capitalize',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: c,
        }}
      />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ======================================================
// MY ORDERS
// ======================================================

export function MerchantOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const endpoint = filter
        ? `/orders/merchant/my?status=${filter}`
        : '/orders/merchant/my';

      const data = await apiCall(
        endpoint,
        token
      );

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const statuses = [
    '',
    'pending',
    'assigned',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'returned',
    'cancelled',
  ];

  return (
    <div
      style={{
        padding: 28,
        color: '#f8fafc',
      }}
    >

      {/* FILTERS */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        {statuses.map(s => {
          const active = filter === s;

          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: active
                  ? 'linear-gradient(135deg,#3b82f6,#6366f1)'
                  : 'rgba(255,255,255,.04)',
                border:
                  '1px solid rgba(255,255,255,.08)',
                color: active
                  ? '#fff'
                  : 'rgba(255,255,255,.65)',
                transition: '.15s',
              }}
            >
              {s
                ? s.replace(/_/g, ' ')
                : 'All Orders'}
            </button>
          );
        })}
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background:
            'rgba(15,23,42,.72)',
          border:
            '1px solid rgba(255,255,255,.08)',
          borderRadius: 18,
          overflow: 'hidden',
          backdropFilter: 'blur(16px)',
          boxShadow:
            '0 10px 40px rgba(0,0,0,.35)',
        }}
      >

        {/* HEADER */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            My Orders
          </div>

          <div
            style={{
              fontSize: 12,
              color:
                'rgba(255,255,255,.4)',
              marginTop: 2,
            }}
          >
            {orders.length} total orders
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div
            style={{
              padding: '70px 20px',
              textAlign: 'center',
              color:
                'rgba(255,255,255,.35)',
              fontSize: 14,
            }}
          >
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
            }}
          >
            <div
              style={{
                fontSize: 42,
                marginBottom: 14,
              }}
            >
              📭
            </div>

            <div
              style={{
                fontSize: 14,
                color:
                  'rgba(255,255,255,.35)',
              }}
            >
              No orders found
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  {[
                    'Tracking ID',
                    'Customer',
                    'Zone',
                    'Rider',
                    'COD',
                    'Charge',
                    'Status',
                    'Date',
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding:
                          '12px 18px',
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          'rgba(255,255,255,.35)',
                        textTransform:
                          'uppercase',
                        letterSpacing:
                          '.07em',
                        background:
                          'rgba(255,255,255,.03)',
                        borderBottom:
                          '1px solid rgba(255,255,255,.06)',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,.05)',
                      transition:
                        'background .15s',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background =
                        'rgba(255,255,255,.03)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        'transparent')
                    }
                  >

                    {/* TRACKING */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily:
                            'DM Mono, monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#60a5fa',
                        }}
                      >
                        {o.tracking_id}
                      </span>
                    </td>

                    {/* CUSTOMER */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color:
                            '#f8fafc',
                        }}
                      >
                        {o.customer_name}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color:
                            'rgba(255,255,255,.35)',
                          marginTop: 2,
                        }}
                      >
                        {
                          o.customer_phone
                        }
                      </div>
                    </td>

                    {/* ZONE */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                        fontSize: 13,
                        color:
                          'rgba(255,255,255,.55)',
                      }}
                    >
                      {o.zone_name ||
                        '—'}
                    </td>

                    {/* RIDER */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                        fontSize: 13,
                        color:
                          o.rider_name
                            ? 'rgba(255,255,255,.55)'
                            : 'rgba(255,255,255,.25)',
                      }}
                    >
                      {o.rider_name ||
                        'Pending'}
                    </td>

                    {/* COD */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                        fontFamily:
                          'DM Mono, monospace',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#fbbf24',
                      }}
                    >
                      ৳
                      {Number(
                        o.cod_amount ||
                          0
                      ).toLocaleString()}
                    </td>

                    {/* DELIVERY CHARGE */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                        fontFamily:
                          'DM Mono, monospace',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#34d399',
                      }}
                    >
                      ৳
                      {Number(
                        o.delivery_charge ||
                          0
                      ).toLocaleString()}
                    </td>

                    {/* STATUS */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                      }}
                    >
                      <MBadge
                        status={o.status}
                      />
                    </td>

                    {/* DATE */}
                    <td
                      style={{
                        padding:
                          '14px 18px',
                        fontSize: 12,
                        color:
                          'rgba(255,255,255,.35)',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {fmtDate(
                        o.created_at
                      )}
                    </td>
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

// ======================================================
// LEDGER
// ======================================================

export function MerchantLedger({
  token,
  user,
}) {
  const [orders, setOrders] =
    useState([]);

  const load = useCallback(async () => {
    try {
      await apiCall(
        '/merchants/me/ledger',
        token
      );
    } catch {}

    try {
      const data = await apiCall(
        '/orders/merchant/my',
        token
      );

      setOrders(data.orders || []);
    } catch {}
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const balance = Number(
    user?.balance || 0
  );

  const totalCOD = orders
    .filter(
      o => o.status === 'delivered'
    )
    .reduce(
      (s, o) =>
        s +
        Number(
          o.cod_amount || 0
        ),
      0
    );

  const totalCharges = orders
    .filter(
      o => o.status === 'delivered'
    )
    .reduce(
      (s, o) =>
        s +
        Number(
          o.delivery_charge || 0
        ),
      0
    );

  return (
    <div
      style={{
        padding: 28,
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          [
            'Pending Balance',
            '৳' +
              balance.toLocaleString(),
            '#34d399',
          ],

          [
            'Total COD',
            '৳' +
              totalCOD.toLocaleString(),
            '#fbbf24',
          ],

          [
            'Delivery Charges',
            '৳' +
              totalCharges.toLocaleString(),
            '#60a5fa',
          ],
        ].map(
          ([label, value, color], i) => (
            <div
              key={i}
              style={{
                background:
                  'rgba(15,23,42,.72)',
                border:
                  '1px solid rgba(255,255,255,.08)',
                borderRadius: 18,
                padding: 22,
                backdropFilter:
                  'blur(16px)',
                boxShadow:
                  '0 10px 40px rgba(0,0,0,.35)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color:
                    'rgba(255,255,255,.35)',
                  textTransform:
                    'uppercase',
                  marginBottom: 6,
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontFamily:
                    'DM Mono, monospace',
                  fontSize: 28,
                  fontWeight: 700,
                  color,
                }}
              >
                {value}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}