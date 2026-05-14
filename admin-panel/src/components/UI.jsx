// ============================================================
// UI.jsx  —  Sylhet Courier Admin Panel — Shared Components
// Copy this file to:  admin-panel/src/components/UI.jsx
// ============================================================

import { useState, useEffect } from 'react';

// ── Status Badge ─────────────────────────────────────────────
const STATUS_MAP = {
  pending:          { label: 'Pending',          bg: 'rgba(251,191,36,.15)',  color: '#fbbf24', dot: '#f59e0b' },
  assigned:         { label: 'Assigned',         bg: 'rgba(99,102,241,.15)', color: '#a78bfa', dot: '#7c3aed' },
  picked_up:        { label: 'Picked Up',        bg: 'rgba(59,130,246,.15)', color: '#93c5fd', dot: '#3b82f6' },
  out_for_delivery: { label: 'Out for Delivery', bg: 'rgba(249,115,22,.15)', color: '#fb923c', dot: '#f97316' },
  delivered:        { label: 'Delivered',        bg: 'rgba(16,185,129,.15)', color: '#34d399', dot: '#10b981' },
  failed:           { label: 'Failed',           bg: 'rgba(239,68,68,.15)',  color: '#f87171', dot: '#ef4444' },
  returned:         { label: 'Returned',         bg: 'rgba(156,163,175,.15)',color: '#9ca3af', dot: '#6b7280' },
  cancelled:        { label: 'Cancelled',        bg: 'rgba(239,68,68,.15)',  color: '#f87171', dot: '#ef4444' },
  online:           { label: 'Online',           bg: 'rgba(16,185,129,.15)', color: '#34d399', dot: '#10b981' },
  offline:          { label: 'Offline',          bg: 'rgba(156,163,175,.12)',color: '#9ca3af', dot: '#6b7280' },
  suspended:        { label: 'Suspended',        bg: 'rgba(239,68,68,.15)',  color: '#f87171', dot: '#ef4444' },
  active:           { label: 'Active',           bg: 'rgba(16,185,129,.15)', color: '#34d399', dot: '#10b981' },
};

export function Badge({ status }) {
  const s = STATUS_MAP[status] || { label: status || '—', bg: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)', dot: 'rgba(255,255,255,.3)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      borderRadius: 99, padding: '3px 10px 3px 8px',
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

// ── Cash Progress Bar ────────────────────────────────────────
export function CashBar({ current, limit }) {
  const pct = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
  const color = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden', minWidth: 80 }}>
        <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 99, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

// ── Toast Notification ───────────────────────────────────────
export function Toast({ message, type, visible }) {
  if (!visible) return null;
  const colors = { success: '#34d399', error: '#f87171', info: '#93c5fd' };
  const bgs    = { success: 'rgba(16,185,129,.12)', error: 'rgba(239,68,68,.12)', info: 'rgba(59,130,246,.12)' };
  const icons  = { success: 'ti-circle-check', error: 'ti-circle-x', info: 'ti-info-circle' };
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: bgs[type] || bgs.info,
      border: `1px solid ${colors[type] || colors.info}44`,
      color: colors[type] || colors.info,
      borderRadius: 12, padding: '12px 20px',
      fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      animation: 'fadeIn .2s ease',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <i className={`ti ${icons[type] || icons.info}`} style={{ fontSize: 16 }} />
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  function showToast(message, type = 'info') {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return [toast, showToast];
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#13161e', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 20, padding: 32, width: 500, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {title && <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 24 }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

// ── Field wrapper ────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,.35)', marginBottom: 6,
          textTransform: 'uppercase', letterSpacing: '.05em',
        }}>{label}</label>
      )}
      {children}
    </div>
  );
}

// ── Input ────────────────────────────────────────────────────
export function Input({ type = 'text', value, onChange, placeholder, ...rest }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 13px',
        background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.1)',
        borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none',
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
      {...rest}
    />
  );
}

// ── Select ───────────────────────────────────────────────────
export function Select({ value, onChange, children, ...rest }) {
  return (
    <select
      value={value} onChange={onChange}
      style={{
        width: '100%', padding: '10px 13px',
        background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.1)',
        borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none',
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

// ── Button ───────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', disabled, style: extraStyle }) {
  const variants = {
    primary:  { background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', border: 'none' },
    danger:   { background: 'rgba(239,68,68,.15)', color: '#f87171', border: '1px solid rgba(239,68,68,.3)' },
    success:  { background: 'rgba(16,185,129,.15)', color: '#34d399', border: '1px solid rgba(16,185,129,.3)' },
    ghost:    { background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.1)' },
    warning:  { background: 'rgba(251,191,36,.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.3)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      ...variants[variant],
      ...extraStyle,
    }}>
      {children}
    </button>
  );
}