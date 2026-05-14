import { useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminRiders from './pages/AdminRiders';
import AdminMerchants from './pages/AdminMerchants';
import { AdminFinance, AdminZones } from './pages/AdminFinance';

// ── SVG Icons ────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Orders: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Riders: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 012-2h6a2 2 0 012 2v1.662" />
    </svg>
  ),
  Merchants: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Finance: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Zones: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
  Brand: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ── Nav items ────────────────────────────────────────────────
const NAV = [
  { key: 'dashboard', label: 'Dashboard',  Icon: Icons.Dashboard },
  { key: 'orders',    label: 'Orders',     Icon: Icons.Orders    },
  { key: 'riders',    label: 'Riders',     Icon: Icons.Riders    },
  { key: 'merchants', label: 'Merchants',  Icon: Icons.Merchants },
  { key: 'finance',   label: 'Finance',    Icon: Icons.Finance   },
  { key: 'zones',     label: 'Zones',      Icon: Icons.Zones     },
];

// ── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, onNavigate, user, onLogout }) {
  return (
    <div style={{
      width: 230, minHeight: '100vh', background: '#0c0f1a',
      borderRight: '1px solid rgba(255,255,255,.07)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            borderRadius: 11, display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(59,130,246,.35)',
            color: '#fff',
          }}>
            <Icons.Brand />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-.3px' }}>
              Sylhet Courier
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button key={key} onClick={() => onNavigate(key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 10, marginBottom: 2,
              background: isActive ? 'rgba(59,130,246,.15)' : 'transparent',
              border: isActive ? '1px solid rgba(59,130,246,.25)' : '1px solid transparent',
              color: isActive ? '#93c5fd' : 'rgba(255,255,255,.45)',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              cursor: 'pointer', textAlign: 'left',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.45)'; }}}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div style={{
        padding: '16px 14px',
        borderTop: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 10px', borderRadius: 10,
          background: 'rgba(255,255,255,.04)',
          marginBottom: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>
              {user?.role || 'admin'}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', padding: '8px', borderRadius: 9,
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)',
          color: 'rgba(239,68,68,.7)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 7,
        }}>
          <Icons.Logout /> Logout
        </button>
      </div>
    </div>
  );
}

// ── Top Header ───────────────────────────────────────────────
function Header({ page }) {
  const item = NAV.find(n => n.key === page) || NAV[0];
  const PageIcon = item.Icon; // must be capitalized for JSX to treat it as a component
  return (
    <div style={{
      height: 60, display: 'flex', alignItems: 'center',
      padding: '0 28px', borderBottom: '1px solid rgba(255,255,255,.07)',
      background: 'rgba(8,11,20,.8)', backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <span style={{ marginRight: 10, color: '#93c5fd', display: 'flex', alignItems: 'center' }}>
        <PageIcon />
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{item.label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Sylhet Courier · Admin</div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(null);
  const [user,  setUser]  = useState(null);
  const [page,  setPage]  = useState('dashboard');

  function handleLogin(t, u) {
    setToken(t);
    setUser(u);
    setPage('dashboard');
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setPage('dashboard');
  }

  // ── Not logged in → show login screen
  if (!token) return <AdminLogin onLogin={handleLogin} />;

  // ── Logged in → show layout
  const pageProps = { token, onNavigate: setPage };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b14',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(37,99,235,.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,.05) 0%, transparent 50%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#f1f5f9',
    }}>
      {/* Sidebar */}
      <Sidebar active={page} onNavigate={setPage} user={user} onLogout={handleLogout} />

      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft: 230, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header page={page} />
        <main style={{ flex: 1 }}>
          {page === 'dashboard' && <AdminDashboard {...pageProps} />}
          {page === 'orders'    && <AdminOrders    {...pageProps} />}
          {page === 'riders'    && <AdminRiders    {...pageProps} />}
          {page === 'merchants' && <AdminMerchants {...pageProps} />}
          {page === 'finance'   && <AdminFinance   {...pageProps} />}
          {page === 'zones'     && <AdminZones     {...pageProps} />}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #080b14; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.2); }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        select option { background: #1a1f2c; color: #f1f5f9; }
        button { font-family: inherit; }
        input, select { font-family: inherit; }
      `}</style>
    </div>
  );
}