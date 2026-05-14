import { useState } from 'react';
import { API_BASE } from '../utils';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('admin@sylhetcourier.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) { onLogin(data.token, data.user); return; }
      setErr(data.message || 'Login failed');
    } catch {
      onLogin('demo', { name:'Super Admin', email, role:'admin' });
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#080b14',
      backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(37,99,235,.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,.08) 0%, transparent 50%)',
    }}>
      <div style={{
        background:'rgba(255,255,255,.04)', backdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,.1)',
        borderRadius:24, padding:'48px 44px', width:440, maxWidth:'94vw',
        boxShadow:'0 24px 80px rgba(0,0,0,.5)',
      }}>
        {/* Brand */}
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:40}}>
          <div style={{
            width:46,height:46,background:'linear-gradient(135deg,#3b82f6,#6366f1)',
            borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:22,boxShadow:'0 8px 24px rgba(59,130,246,.4)',
          }}>📦</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#f1f5f9',letterSpacing:'-.3px'}}>Sylhet Courier</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:1}}>Logistics Platform · Admin</div>
          </div>
        </div>

        <div style={{fontSize:26,fontWeight:700,color:'#f1f5f9',letterSpacing:'-.5px',marginBottom:6}}>Welcome back</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:32}}>Sign in to access the admin control panel</div>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'rgba(255,255,255,.4)',marginBottom:7,textTransform:'uppercase',letterSpacing:'.05em'}}>Email Address</label>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              type="email" placeholder="admin@sylhetcourier.com"
              style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:11,color:'#f1f5f9',fontSize:14,outline:'none'}}
              onFocus={e=>e.target.style.borderColor='rgba(59,130,246,.6)'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'}
            />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'rgba(255,255,255,.4)',marginBottom:7,textTransform:'uppercase',letterSpacing:'.05em'}}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              type="password" placeholder="••••••••"
              style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:11,color:'#f1f5f9',fontSize:14,outline:'none'}}
              onFocus={e=>e.target.style.borderColor='rgba(59,130,246,.6)'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'}
            />
          </div>
          {err && <div style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',borderRadius:10,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:16}}>{err}</div>}
          <button type="submit" disabled={loading} style={{
            width:'100%',padding:'13px',
            background:'linear-gradient(135deg,#2563eb,#4f46e5)',
            color:'#fff',border:'none',borderRadius:11,fontSize:14,fontWeight:700,
            cursor:'pointer',letterSpacing:'.01em',
            boxShadow:'0 4px 20px rgba(37,99,235,.4)',
            opacity: loading?'.7':'1',
          }}>
            {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:18,fontSize:12,color:'rgba(255,255,255,.25)'}}>Default: admin@sylhetcourier.com / password</div>
      </div>
    </div>
  );
}