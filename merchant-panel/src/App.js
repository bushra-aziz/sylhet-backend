import { useState } from 'react';
import MerchantLogin from './pages/MerchantLogin';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantNewOrder from './pages/MerchantNewOrder';
import { MerchantOrders, MerchantLedger } from './pages/MerchantPages';

// ── SVG Icons ────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),

  NewOrder: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),

  Orders: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),

  Ledger: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),

  Brand: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),

  Logout: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),

  Plus: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

// ── Nav items ─────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: Icons.Dashboard },
  { id: 'new-order', label: 'New Order', Icon: Icons.NewOrder },
  { id: 'orders', label: 'My Orders', Icon: Icons.Orders },
  { id: 'ledger', label: 'Ledger & Payouts', Icon: Icons.Ledger },
];

export default function MerchantPanel() {
  const [token, setToken] = useState(() => localStorage.getItem('sc_merchant_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sc_merchant_user') || 'null'));
  const [page, setPage] = useState('dashboard');

  function onLogin(t, u) {
    setToken(t);
    setUser(u);

    localStorage.setItem('sc_merchant_token', t);
    localStorage.setItem('sc_merchant_user', JSON.stringify(u));
  }

  function onLogout() {
    setToken(null);
    setUser(null);

    localStorage.removeItem('sc_merchant_token');
    localStorage.removeItem('sc_merchant_user');
  }

  if (!token) return <MerchantLogin onLogin={onLogin} />;

  const initials = (user?.business_name || 'M')[0].toUpperCase();
  const activeNav = NAV.find(n => n.id === page) || NAV[0];
  const ActivePageIcon = activeNav.Icon;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#020817',
        backgroundImage: `
          radial-gradient(circle at top left, rgba(59,130,246,.12), transparent 30%),
          radial-gradient(circle at bottom right, rgba(99,102,241,.10), transparent 30%)
        `,
        color: '#f8fafc',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}
    >

      {/* Sidebar */}
      <aside
        style={{
          width: 248,
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#020617',
          borderRight: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}
      >

        {/* Brand */}
        <div
          style={{
            padding: '22px 20px 18px',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 10px 30px rgba(59,130,246,.35)',
            }}
          >
            <Icons.Brand />
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
              Sylhet Courier
            </div>

            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
              Merchant Portal
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px' }}>
          {NAV.map(({ id, label, Icon }) => {
            const isActive = page === id;

            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  border: isActive
                    ? '1px solid rgba(59,130,246,.25)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: 6,
                  textAlign: 'left',
                  background: isActive
                    ? 'rgba(59,130,246,.15)'
                    : 'transparent',
                  color: isActive
                    ? '#60a5fa'
                    : 'rgba(255,255,255,.55)',
                  transition: 'all .15s',
                }}
              >
                <Icon />

                <span>{label}</span>

                {id === 'new-order' && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 10,
                      background: 'rgba(59,130,246,.18)',
                      color: '#60a5fa',
                      padding: '2px 7px',
                      borderRadius: 99,
                      fontWeight: 700,
                    }}
                  >
                    NEW
                  </span>
                )}

                {isActive && id !== 'new-order' && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: 5,
                      height: 5,
                      borderRadius: 99,
                      background: '#60a5fa',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(59,130,246,.12)',
                border: '1px solid rgba(59,130,246,.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                fontWeight: 700,
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.business_name || 'My Shop'}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,.35)',
                }}
              >
                Merchant
              </div>
            </div>

            <button
              onClick={onLogout}
              style={{
                padding: '6px 8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 8,
                color: 'rgba(255,255,255,.4)',
                cursor: 'pointer',
              }}
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 248, flex: 1, minHeight: '100vh' }}>

        {/* Topbar */}
        <header
          style={{
            height: 60,
            borderBottom: '1px solid rgba(255,255,255,.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: 'rgba(2,6,23,.75)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span
            style={{
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ActivePageIcon />
          </span>

          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            {activeNav.label}
          </div>

          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            {page !== 'new-order' && (
              <button
                onClick={() => setPage('new-order')}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 10px 24px rgba(59,130,246,.25)',
                }}
              >
                <Icons.Plus />
                New Order
              </button>
            )}

            {user?.balance > 0 && (
              <div
                style={{
                  padding: '7px 14px',
                  background: 'rgba(52,211,153,.12)',
                  border: '1px solid rgba(52,211,153,.25)',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#34d399',
                }}
              >
                Balance: ৳{Number(user.balance).toLocaleString()}
              </div>
            )}
          </div>
        </header>

        {/* Pages */}
        {page === 'dashboard' && (
          <MerchantDashboard
            token={token}
            user={user}
            onNavigate={setPage}
          />
        )}

        {page === 'new-order' && (
          <MerchantNewOrder
            token={token}
            onSuccess={setPage}
          />
        )}

        {page === 'orders' && (
          <MerchantOrders token={token} />
        )}

        {page === 'ledger' && (
          <MerchantLedger
            token={token}
            user={user}
          />
        )}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #020817;
          color: #f8fafc;
        }

        button {
          font-family: inherit;
        }

        input,
        textarea,
        select {
          font-family: inherit;
        }

        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.1);
          border-radius: 99px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}