import { useState, useEffect } from 'react';
import { Badge, useToast, Toast } from '../components/UI';
import { DEMO_MERCHANTS, apiCall } from '../utils';

export default function AdminMerchants({ token }) {
  const [merchants, setMerchants] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ business_name:'', owner_name:'', phone:'', email:'', custom_delivery_rate:'', password:'', address:'' });
  const [toast, showToast] = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await apiCall('/merchants', token);
      setMerchants(data.merchants || DEMO_MERCHANTS);
    } catch { setMerchants(DEMO_MERCHANTS); }
  }

  async function submitAdd() {
    if (!form.business_name || !form.phone) { showToast('Business name and phone required', 'error'); return; }
    try {
      const data = await apiCall('/merchants', token, { method:'POST', body: JSON.stringify({ ...form, custom_delivery_rate: form.custom_delivery_rate?Number(form.custom_delivery_rate):null, password:form.password||null }) });
      if (data.success) { showToast('Merchant added!', 'success'); setAddModal(false); load(); }
      else showToast(data.message||'Error', 'error');
    } catch {
      showToast('Demo: Merchant added!', 'success');
      setMerchants(prev=>[...prev,{...form,id:'new_'+Date.now(),status:'active',balance:0,total_orders:0}]);
      setAddModal(false);
    }
  }

  async function toggle(id, status) {
    try {
      const data = await apiCall(`/merchants/${id}`, token, { method:'PUT', body: JSON.stringify({ status }) });
      if (data.success) { load(); showToast('Updated!', 'success'); }
    } catch {
      setMerchants(prev=>prev.map(m=>m.id===id?{...m,status}:m));
      showToast('Demo: Updated!', 'success');
    }
  }

  const inp = (placeholder, type='text', value, onChange, label) => (
    <div style={{flex:'1 1 calc(50% - 8px)',minWidth:0}}>
      <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.35)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:'100%',padding:'10px 13px',background:'rgba(255,255,255,.06)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:10,color:'#f1f5f9',fontSize:13,outline:'none'}}
        onFocus={e=>e.target.style.borderColor='rgba(59,130,246,.5)'}
        onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}
      />
    </div>
  );

  return (
    <div style={{padding:28}}>
      <Toast {...toast}/>
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>All Merchants</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:2}}>{merchants.length} merchants registered</div>
          </div>
          <button onClick={()=>{setForm({business_name:'',owner_name:'',phone:'',email:'',custom_delivery_rate:'',password:'',address:''});setAddModal(true);}} style={{marginLeft:'auto',background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'#fff',border:'none',borderRadius:10,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Add Merchant</button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Business','Owner','Phone','Status','Balance','Delivery Rate','Orders','Actions'].map(h=>(
                <th key={h} style={{textAlign:'left',padding:'11px 18px',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em',borderBottom:'1px solid rgba(255,255,255,.07)',background:'rgba(0,0,0,.2)',whiteSpace:'nowrap'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {merchants.map((m,i)=>(
                <tr key={i}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}
                >
                  <td style={{padding:'13px 18px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,rgba(37,99,235,.3),rgba(79,70,229,.3))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🛍</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#e2e8f0'}}>{m.business_name}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{m.address||'No address'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'13px 18px',fontSize:13,color:'rgba(255,255,255,.6)'}}>{m.owner_name}</td>
                  <td style={{padding:'13px 18px',fontFamily:'DM Mono,monospace',fontSize:12,color:'rgba(255,255,255,.5)'}}>{m.phone}</td>
                  <td style={{padding:'13px 18px'}}><Badge status={m.status}/></td>
                  <td style={{padding:'13px 18px',fontFamily:'DM Mono,monospace',fontSize:13,fontWeight:600,color: Number(m.balance||0)>=0?'#34d399':'#f87171'}}>৳{Number(m.balance||0).toLocaleString()}</td>
                  <td style={{padding:'13px 18px',fontSize:13,color: m.custom_delivery_rate?'rgba(255,255,255,.8)':'rgba(255,255,255,.3)'}}>
                    {m.custom_delivery_rate ? <span style={{fontFamily:'DM Mono,monospace',fontWeight:600}}>৳{m.custom_delivery_rate}</span> : 'Zone rate'}
                  </td>
                  <td style={{padding:'13px 18px',fontSize:13,color:'rgba(255,255,255,.5)'}}>{m.total_orders||0}</td>
                  <td style={{padding:'13px 18px'}}>
                    {m.status==='active'
                      ? <button onClick={()=>toggle(m.id,'suspended')} style={{padding:'5px 12px',background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Suspend</button>
                      : <button onClick={()=>toggle(m.id,'active')} style={{padding:'5px 12px',background:'rgba(16,185,129,.12)',border:'1px solid rgba(16,185,129,.25)',color:'#34d399',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Activate</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Merchant Modal */}
      {addModal && (
        <div onClick={()=>setAddModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#13161e',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:32,width:540,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',marginBottom:4}}>Add New Merchant</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>Merchant login with phone + password</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {inp('Sylhet Fashion House','text',form.business_name,e=>setForm(f=>({...f,business_name:e.target.value})),'Business Name')}
              {inp('Owner full name','text',form.owner_name,e=>setForm(f=>({...f,owner_name:e.target.value})),'Owner Name')}
              {inp('01XXXXXXXXX','tel',form.phone,e=>setForm(f=>({...f,phone:e.target.value})),'Phone')}
              {inp('shop@example.com','email',form.email,e=>setForm(f=>({...f,email:e.target.value})),'Email (optional)')}
              {inp('Leave blank for zone rate','number',form.custom_delivery_rate,e=>setForm(f=>({...f,custom_delivery_rate:e.target.value})),'Custom Rate (৳)')}
              {inp('Leave blank to use phone','password',form.password,e=>setForm(f=>({...f,password:e.target.value})),'Password')}
              <div style={{flex:'1 1 100%'}}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.35)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Address</label>
                <input type="text" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Shop address"
                  style={{width:'100%',padding:'10px 13px',background:'rgba(255,255,255,.06)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:10,color:'#f1f5f9',fontSize:13,outline:'none'}}
                />
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:24,justifyContent:'flex-end'}}>
              <button onClick={()=>setAddModal(false)} style={{padding:'10px 20px',borderRadius:10,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:13,fontWeight:600}}>Cancel</button>
              <button onClick={submitAdd} style={{padding:'10px 22px',borderRadius:10,background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:700}}>Add Merchant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}