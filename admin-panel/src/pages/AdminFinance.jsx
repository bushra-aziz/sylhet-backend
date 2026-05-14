import { useState, useEffect } from 'react';
import { CashBar, useToast, Toast } from '../components/UI';
import { DEMO_RIDERS, ZONES, apiCall } from '../utils';

export function AdminFinance({ token }) {
  const [riders, setRiders] = useState([]);
  const [depositModal, setDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNotes, setDepositNotes] = useState('');
  const [toast, showToast] = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await apiCall('/riders', token);
      setRiders(data.riders || DEMO_RIDERS);
    } catch { setRiders(DEMO_RIDERS); }
  }

  async function submitDeposit() {
    const amount = parseFloat(depositAmount);
    if (!amount) { showToast('Enter valid amount', 'error'); return; }
    try {
      const data = await apiCall(`/riders/${depositModal.id}/deposit`, token, { method:'POST', body: JSON.stringify({ amount, notes:depositNotes }) });
      if (data.success) { showToast('Deposit recorded!', 'success'); setDepositModal(null); load(); }
      else showToast(data.message||'Error','error');
    } catch {
      setRiders(prev=>prev.map(r=>r.id===depositModal.id?{...r,current_cash:Math.max(0,r.current_cash-amount)}:r));
      showToast('Demo: Deposit recorded!', 'success');
      setDepositModal(null);
    }
  }

  const totalCash = riders.reduce((s,r)=>s+(Number(r.current_cash)||0),0);

  return (
    <div style={{padding:28}}>
      <Toast {...toast}/>

      {/* Summary card */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:28}}>
        <div style={{background:'rgba(251,191,36,.08)',border:'1px solid rgba(251,191,36,.2)',borderRadius:16,padding:22,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'#f59e0b',borderRadius:'16px 16px 0 0'}}/>
          <div style={{fontSize:12,fontWeight:600,color:'rgba(251,191,36,.6)',textTransform:'uppercase',letterSpacing:'.06em'}}>Total Cash In Circulation</div>
          <div style={{fontSize:36,fontWeight:700,color:'#fbbf24',margin:'8px 0 4px',letterSpacing:'-1px',fontFamily:'DM Mono,monospace'}}>৳{totalCash.toLocaleString()}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>Across {riders.filter(r=>r.current_cash>0).length} riders</div>
        </div>
        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:22,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'#ef4444',borderRadius:'16px 16px 0 0'}}/>
          <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em'}}>Near Limit (&gt;80%)</div>
          <div style={{fontSize:36,fontWeight:700,color:'#f87171',margin:'8px 0 4px',letterSpacing:'-1px',fontFamily:'DM Mono,monospace'}}>
            {riders.filter(r=>(r.current_cash/(r.cod_limit||10000))>0.8).length}
          </div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>Riders at risk</div>
        </div>
      </div>

      {/* Rider settlement table */}
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>Rider Cash Settlement</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:2}}>Record COD deposits and clear rider balances</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Rider','Phone','Current Cash','COD Limit','Usage','Action'].map(h=>(
                <th key={h} style={{textAlign:'left',padding:'11px 20px',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em',borderBottom:'1px solid rgba(255,255,255,.07)',background:'rgba(0,0,0,.2)',whiteSpace:'nowrap'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {riders.map((r,i)=>{
                const pct = Math.round((r.current_cash/(r.cod_limit||10000))*100);
                const alertColor = pct>80?'#ef4444':pct>60?'#f59e0b':'#10b981';
                return (
                  <tr key={i}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}
                  >
                    <td style={{padding:'14px 20px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{r.name}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{r.zone_name}</div>
                    </td>
                    <td style={{padding:'14px 20px',fontFamily:'DM Mono,monospace',fontSize:12,color:'rgba(255,255,255,.5)'}}>{r.phone}</td>
                    <td style={{padding:'14px 20px',fontFamily:'DM Mono,monospace',fontSize:14,fontWeight:700,color:'#fbbf24'}}>৳{Number(r.current_cash||0).toLocaleString()}</td>
                    <td style={{padding:'14px 20px',fontFamily:'DM Mono,monospace',fontSize:13,color:'rgba(255,255,255,.4)'}}>৳{Number(r.cod_limit||0).toLocaleString()}</td>
                    <td style={{padding:'14px 20px',minWidth:160}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{flex:1,height:6,background:'rgba(255,255,255,.08)',borderRadius:99,overflow:'hidden'}}>
                          <div style={{height:'100%',width:pct+'%',background:alertColor,borderRadius:99,transition:'width .4s'}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:alertColor,minWidth:32}}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{padding:'14px 20px'}}>
                      <button onClick={()=>{setDepositModal(r);setDepositAmount(r.current_cash||'');setDepositNotes('');}}
                        style={{padding:'7px 16px',background:r.current_cash>0?'rgba(251,191,36,.15)':'rgba(255,255,255,.05)',border:`1px solid ${r.current_cash>0?'rgba(251,191,36,.3)':'rgba(255,255,255,.1)'}`,color:r.current_cash>0?'#fbbf24':'rgba(255,255,255,.3)',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                        💰 Collect Cash
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div onClick={()=>setDepositModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#13161e',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:32,width:420,maxWidth:'100%'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',marginBottom:4}}>Record Cash Deposit</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>
              <strong style={{color:'#fbbf24'}}>{depositModal.name}</strong> currently holds{' '}
              <strong style={{color:'#fbbf24'}}>৳{Number(depositModal.current_cash||0).toLocaleString()}</strong>
            </div>
            {[['Amount (৳)','number',depositAmount,setDepositAmount],['Notes (optional)','text',depositNotes,setDepositNotes]].map(([label,type,val,set],i)=>(
              <div key={i} style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.35)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>
                <input type={type} value={val} onChange={e=>set(e.target.value)}
                  style={{width:'100%',padding:'11px 13px',background:'rgba(255,255,255,.06)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:10,color:'#f1f5f9',fontSize:14,outline:'none'}}
                />
              </div>
            ))}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:24}}>
              <button onClick={()=>setDepositModal(null)} style={{padding:'10px 20px',borderRadius:10,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:13,fontWeight:600}}>Cancel</button>
              <button onClick={submitDeposit} style={{padding:'10px 22px',borderRadius:10,background:'rgba(251,191,36,.2)',border:'1px solid rgba(251,191,36,.4)',color:'#fbbf24',cursor:'pointer',fontSize:13,fontWeight:700}}>💰 Record Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminZones() {
  const zones = ZONES;
  return (
    <div style={{padding:28}}>
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>Sylhet Delivery Zones</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:2}}>Coverage areas and base delivery rates</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:1,padding:0}}>
          {zones.map((z,i)=>(
            <div key={i} style={{padding:'20px 22px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:'rgba(59,130,246,.1)',border:'1px solid rgba(59,130,246,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🗺</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'#e2e8f0'}}>{z.name}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:1}}>Sylhet City</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:16,fontWeight:700,color:'#34d399'}}>৳{z.base_delivery_rate}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.04em'}}>Base rate</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}