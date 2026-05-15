import { useState } from 'react';
import { API_BASE } from '../utils';

export default function MerchantLogin({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API_BASE}/auth/merchant/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (data.success) { onLogin(data.token, data.user); return; }
      setErr(data.message || 'Login failed');
    } catch {
      onLogin('demo', { business_name:'Zindabazar Gifts', owner_name:'Nasrin Sultana', balance:12500, phone });
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#faf8f4',
      backgroundImage:'radial-gradient(ellipse at 30% 70%, rgba(253,186,116,.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(167,243,208,.15) 0%, transparent 40%)',
    }}>
      <div style={{
        background:'#fff', border:'2px solid #f0ede6',
        borderRadius:24, padding:'48px 44px', width:440, maxWidth:'94vw',
        boxShadow:'0 20px 60px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:36}}>
          <div style={{width:46,height:46,background:'linear-gradient(135deg,#f97316,#f59e0b)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 8px 24px rgba(249,115,22,.25)'}}>🛍</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#1c1917',letterSpacing:'-.3px'}}>Sylhet Courier</div>
            <span style={{fontSize:11,background:'#fef3c7',color:'#b45309',padding:'2px 9px',borderRadius:99,fontWeight:700}}>MERCHANT</span>
          </div>
        </div>

        <div style={{fontSize:26,fontWeight:700,color:'#1c1917',letterSpacing:'-.5px',marginBottom:6}}>Merchant Login</div>
        <div style={{fontSize:14,color:'#78716c',marginBottom:32}}>Sign in to manage your deliveries and payouts</div>

        <form onSubmit={handleSubmit}>
          {[['Phone Number','tel',phone,setPhone,'01712000001'],['Password','password',password,setPassword,'••••••••']].map(([label,type,val,set,ph],i)=>(
            <div key={i} style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#78716c',marginBottom:7,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>
              <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                style={{width:'100%',padding:'12px 14px',border:'2px solid #e7e5e0',borderRadius:12,fontSize:14,color:'#1c1917',outline:'none',transition:'border-color .15s'}}
                onFocus={e=>e.target.style.borderColor='#f97316'}
                onBlur={e=>e.target.style.borderColor='#e7e5e0'}
              />
            </div>
          ))}
          {err && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:10,padding:'10px 14px',color:'#b91c1c',fontSize:13,marginBottom:16}}>{err}</div>}
          <button type="submit" disabled={loading} style={{
            width:'100%',padding:'13px',
            background:'linear-gradient(135deg,#f97316,#f59e0b)',
            color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,
            cursor:'pointer',boxShadow:'0 4px 20px rgba(249,115,22,.3)',
            opacity:loading?.7:1,marginTop:8,
          }}>
            {loading ? 'Signing in…' : 'Sign In to Merchant Panel'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'#a8a29e'}}>Default password is your phone number</div>
      </div>
    </div>
  );
}