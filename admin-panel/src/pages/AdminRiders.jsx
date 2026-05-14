import { useState, useEffect, useCallback } from 'react';
import { Badge, useToast, Toast, CashBar } from '../components/UI';
import { DEMO_RIDERS, ZONES, apiCall } from '../utils';

export default function AdminRiders({ token }) {
  const [riders, setRiders] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [zones, setZones] = useState(ZONES);
  const [toast, showToast] = useToast();
  const [form, setForm] = useState({ name:'', phone:'', nid_number:'', vehicle_type:'motorcycle', zone_id:'', cod_limit:10000, password:'' });
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNotes, setDepositNotes] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiCall('/riders', token);
      setRiders(data.riders || DEMO_RIDERS);
    } catch { setRiders(DEMO_RIDERS); }
  }, [token]);

  const loadZones = useCallback(async () => {
    try {
      const data = await fetch('http://localhost:5000/api/merchants/zones').then(r=>r.json());
      if (data.zones?.length) setZones(data.zones);
    } catch {}
  }, []);

  useEffect(() => { load(); loadZones(); }, [load, loadZones]);

  async function submitAdd() {
    if (!form.name || !form.phone) { showToast('Name and phone required', 'error'); return; }
    try {
      const data = await apiCall('/riders', token, { method:'POST', body: JSON.stringify({ ...form, cod_limit: Number(form.cod_limit)||10000, password: form.password||null }) });
      if (data.success) { showToast('Rider added!', 'success'); setAddModal(false); load(); }
      else showToast(data.message||'Error', 'error');
    } catch {
      showToast('Demo: Rider added!', 'success');
      setRiders(prev=>[...prev,{...form,id:'new_'+Date.now(),status:'offline',current_cash:0,total_earnings:0,zone_name:zones.find(z=>z.id===form.zone_id)?.name||'—'}]);
      setAddModal(false);
    }
  }

  async function submitDeposit() {
    const amount = parseFloat(depositAmount);
    if (!amount) { showToast('Enter a valid amount', 'error'); return; }
    try {
      const data = await apiCall(`/riders/${depositModal.id}/deposit`, token, { method:'POST', body: JSON.stringify({ amount, notes:depositNotes }) });
      if (data.success) { showToast('Deposit recorded!', 'success'); setDepositModal(null); load(); }
      else showToast(data.message||'Error', 'error');
    } catch {
      showToast('Demo: Deposit recorded!', 'success');
      setRiders(prev=>prev.map(r=>r.id===depositModal.id?{...r,current_cash:r.current_cash-amount}:r));
      setDepositModal(null);
    }
  }

  async function toggleStatus(id, status) {
    try {
      const data = await apiCall(`/riders/${id}`, token, { method:'PUT', body: JSON.stringify({ status }) });
      if (data.success) { load(); showToast('Rider updated', 'success'); }
    } catch {
      setRiders(prev=>prev.map(r=>r.id===id?{...r,status}:r));
      showToast('Demo: Status updated', 'success');
    }
  }

  const S = (label,v) => <div style={{flex:'1 1 calc(50% - 8px)',minWidth:0}}>
    <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.35)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>
    {v}
  </div>;

  const inp = (id, placeholder, type='text', value, onChange) => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{width:'100%',padding:'10px 13px',background:'rgba(255,255,255,.06)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:10,color:'#f1f5f9',fontSize:13,outline:'none'}}
      onFocus={e=>e.target.style.borderColor='rgba(59,130,246,.5)'}
      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}
    />
  );

  return (
    <div style={{padding:28}}>
      <Toast {...toast}/>

      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>All Riders</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:2}}>{riders.length} riders registered</div>
          </div>
          <button onClick={()=>{setForm({name:'',phone:'',nid_number:'',vehicle_type:'motorcycle',zone_id:'',cod_limit:10000,password:''});setAddModal(true);}} style={{marginLeft:'auto',background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'#fff',border:'none',borderRadius:10,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Add Rider</button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Name','Phone','NID','Zone','Status','Cash in Hand','COD Limit','Earnings','Actions'].map(h=>(
                <th key={h} style={{textAlign:'left',padding:'11px 18px',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em',borderBottom:'1px solid rgba(255,255,255,.07)',background:'rgba(0,0,0,.2)',whiteSpace:'nowrap'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {riders.map((r,i)=>(
                <tr key={i}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}
                >
                  <td style={{padding:'13px 18px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:99,background:'linear-gradient(135deg,rgba(99,102,241,.3),rgba(139,92,246,.3))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#a78bfa',flexShrink:0}}>
                        {r.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{r.name}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{r.vehicle_type||'motorcycle'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'13px 18px',fontFamily:'DM Mono,monospace',fontSize:12,color:'rgba(255,255,255,.5)'}}>{r.phone}</td>
                  <td style={{padding:'13px 18px',fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,.3)'}}>{r.nid_number||'—'}</td>
                  <td style={{padding:'13px 18px',fontSize:13,color:'rgba(255,255,255,.6)'}}>{r.zone_name||'—'}</td>
                  <td style={{padding:'13px 18px'}}><Badge status={r.status}/></td>
                  <td style={{padding:'13px 18px',minWidth:140}}>
                    <CashBar current={r.current_cash||0} limit={r.cod_limit||10000}/>
                  </td>
                  <td style={{padding:'13px 18px',fontFamily:'DM Mono,monospace',fontSize:13,color:'rgba(255,255,255,.6)'}}>৳{Number(r.cod_limit||0).toLocaleString()}</td>
                  <td style={{padding:'13px 18px',fontFamily:'DM Mono,monospace',fontSize:13,fontWeight:600,color:'#34d399'}}>৳{Number(r.total_earnings||0).toLocaleString()}</td>
                  <td style={{padding:'13px 18px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>{setDepositModal(r);setDepositAmount(r.current_cash||'');setDepositNotes('');}}
                        style={{padding:'5px 12px',background:'rgba(251,191,36,.15)',border:'1px solid rgba(251,191,36,.3)',color:'#fbbf24',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                        💰 Collect
                      </button>
                      {r.status==='suspended'
                        ? <button onClick={()=>toggleStatus(r.id,'active')} style={{padding:'5px 12px',background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',color:'#34d399',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Activate</button>
                        : <button onClick={()=>toggleStatus(r.id,'suspended')} style={{padding:'5px 12px',background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Suspend</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rider Modal */}
      {addModal && (
        <div onClick={()=>setAddModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#13161e',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:32,width:520,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',marginBottom:4}}>Add New Rider</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>Rider can login with phone number</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {S('Full Name', inp('rn','Mohammad Karim','text',form.name,e=>setForm(f=>({...f,name:e.target.value}))))}
              {S('Phone Number', inp('rp','01XXXXXXXXX','tel',form.phone,e=>setForm(f=>({...f,phone:e.target.value}))))}
              {S('NID Number', inp('rid','National ID','text',form.nid_number,e=>setForm(f=>({...f,nid_number:e.target.value}))))}
              {S('Vehicle Type',
                <select value={form.vehicle_type} onChange={e=>setForm(f=>({...f,vehicle_type:e.target.value}))}
                  style={{width:'100%',padding:'10px 13px',background:'rgba(255,255,255,.06)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:10,color:'#f1f5f9',fontSize:13,outline:'none'}}>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="auto">Auto Rickshaw</option>
                </select>
              )}
              {S('Zone',
                <select value={form.zone_id} onChange={e=>setForm(f=>({...f,zone_id:e.target.value}))}
                  style={{width:'100%',padding:'10px 13px',background:'rgba(255,255,255,.06)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:10,color:'#f1f5f9',fontSize:13,outline:'none'}}>
                  <option value="">Select zone</option>
                  {zones.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              )}
              {S('COD Limit (৳)', inp('rc','10000','number',form.cod_limit,e=>setForm(f=>({...f,cod_limit:e.target.value}))))}
              <div style={{flex:'1 1 100%'}}>
                {S('Password (default: phone number)', inp('rpass','Leave blank to use phone number','password',form.password,e=>setForm(f=>({...f,password:e.target.value}))))}
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:24,justifyContent:'flex-end'}}>
              <button onClick={()=>setAddModal(false)} style={{padding:'10px 20px',borderRadius:10,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:13,fontWeight:600}}>Cancel</button>
              <button onClick={submitAdd} style={{padding:'10px 22px',borderRadius:10,background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:700}}>Add Rider</button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModal && (
        <div onClick={()=>setDepositModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#13161e',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:32,width:420,maxWidth:'100%'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',marginBottom:4}}>Record Cash Deposit</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>{depositModal.name} currently holds <span style={{color:'#fbbf24',fontWeight:700}}>৳{Number(depositModal.current_cash||0).toLocaleString()}</span></div>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.35)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Amount (৳)</label>
              {inp('da','Enter collected amount','number',depositAmount,e=>setDepositAmount(e.target.value))}
            </div>
            <div style={{marginBottom:24}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.35)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Notes (optional)</label>
              {inp('dn','Any additional notes','text',depositNotes,e=>setDepositNotes(e.target.value))}
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setDepositModal(null)} style={{padding:'10px 20px',borderRadius:10,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:13,fontWeight:600}}>Cancel</button>
              <button onClick={submitDeposit} style={{padding:'10px 22px',borderRadius:10,background:'rgba(251,191,36,.2)',border:'1px solid rgba(251,191,36,.4)',color:'#fbbf24',cursor:'pointer',fontSize:13,fontWeight:700}}>💰 Record Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}