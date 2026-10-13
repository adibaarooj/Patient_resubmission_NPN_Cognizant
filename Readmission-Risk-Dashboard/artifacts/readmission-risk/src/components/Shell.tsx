import { Activity, ClipboardList, Gauge, HeartPulse, Layers3, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href:'/', label:'Overview', icon:Gauge },
  { href:'/patients', label:'Discharge queue', icon:ClipboardList },
  { href:'/models', label:'Model evaluation', icon:Layers3 },
];

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isActive=(href:string)=>location===href||(href==='/patients'&&location.startsWith('/patients/'));
  return <div className="app-shell flex">
    <aside className="sidebar">
      <div style={{padding:'23px 19px 26px',display:'flex',alignItems:'center',gap:11}}>
        <div className="brand-mark"><HeartPulse size={19} strokeWidth={2.3}/></div>
        <div><div className="brand-name">Tandem</div><div style={{fontSize:9,color:'#a9b9b2',letterSpacing:'.12em',textTransform:'uppercase',marginTop:2}}>Care intelligence</div></div>
      </div>
      <div style={{padding:'0 13px'}}>
        <div style={{fontSize:9,color:'#839b98',textTransform:'uppercase',letterSpacing:'.14em',fontWeight:700,padding:'0 10px 9px'}}>Workspace</div>
        <nav aria-label="Primary navigation" style={{display:'grid',gap:4}}>
          {navItems.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`nav-link${isActive(href)?' active':''}`} data-testid={`link-${label.toLowerCase().replaceAll(' ','-')}`}><Icon size={16}/><span>{label}</span></Link>)}
        </nav>
      </div>
      <div style={{margin:'auto 18px 22px',padding:'14px 13px',border:'1px solid #39555a',borderRadius:10,background:'#263f45'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,color:'#d4b587',fontSize:10,fontWeight:700}}><ShieldCheck size={14}/> Prototype environment</div>
          <div style={{fontSize:10,lineHeight:1.55,color:'#a9bbb5',marginTop:7}}>Fictional codes only. No live data, inference, or clinical connection.</div>
      </div>
      <div style={{borderTop:'1px solid #385056',padding:'12px 20px 16px',fontSize:10,color:'#9aada8'}}>Clinical quality · Demo workspace</div>
    </aside>
    <div className="main-column">
      <header className="topbar">
        <div style={{display:'flex',alignItems:'center',gap:10,color:'#4c625f'}}>
          <div style={{width:27,height:27,display:'grid',placeItems:'center',background:'#e9eee7',borderRadius:8,color:'#46716e'}}><Activity size={15}/></div>
          <div style={{fontSize:11,fontWeight:700}}>Discharge intelligence <span style={{color:'#98a09a',fontWeight:500}}> / 30-day readmission</span></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <span className="mono" style={{fontSize:10,color:'#7e8a82'}}>DEMO · v0.8.2</span>
          <div style={{height:26,width:1,background:'#e6e1d8',margin:'0 3px'}}/>
          <span style={{fontSize:11,color:'#596963',fontWeight:600}}>Discharge care team</span>
        </div>
      </header>
      {children}
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map(({href,label,icon:Icon})=><Link key={href} href={href} className={isActive(href)?'active':''} data-testid={`mobile-link-${label.toLowerCase().replaceAll(' ','-')}`}><Icon size={17}/><span>{label==='Discharge queue'?'Queue':label==='Model evaluation'?'Models':label}</span></Link>)}
    </nav>
    <div className="notice" role="note" data-testid="notice-synthetic"><strong>SYNTHETIC DATA · NOT FOR CLINICAL USE</strong><span>Use fictional codes only. Changes are saved in this browser only; no real patient data is used.</span></div>
  </div>;
}
