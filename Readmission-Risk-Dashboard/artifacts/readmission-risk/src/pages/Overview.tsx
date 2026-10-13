import { ArrowUpRight, CalendarDays, ChevronRight, CircleAlert, FileSearch, ListFilter, Sparkles, UserPlus, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import type { Encounter } from '../data';
import { ragFeature, modelMetrics } from '../data';
import { EncounterDetails, RiskBadge } from '../components/Clinical';

type Props={encounters:Encounter[];selected:Encounter;onSelect:(id:string)=>void;onToggleReviewed:(id:string)=>void};
export function Overview({encounters,selected,onSelect,onToggleReviewed}:Props) {
  const high=encounters.filter(item=>item.riskBand==='High').length;
  const reviewed=encounters.filter(item=>item.reviewed).length;
  const sorted=[...encounters].sort((a,b)=>b.riskProbability-a.riskProbability);
  const best=modelMetrics[3];
  const todayLabel=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  return <main className="content animate-in">
    <div className="page-heading">
      <div><div className="eyebrow">{todayLabel} <span style={{padding:'0 6px',color:'#c7b99f'}}> / </span> Hospital discharge team</div><h1 className="page-title">Today’s care transitions</h1><div className="subtitle">Capture a discharge, check prior synthetic admissions, and review the queue.</div></div>
      <div className="overview-actions"><Link href="/patients/new" className="button button-primary" data-testid="button-add-patient-overview"><UserPlus size={14}/>Add patient</Link><Link href="/patients" className="button" data-testid="button-open-queue">Open queue <ArrowUpRight size={14}/></Link></div>
    </div>
    <div className="section-grid" style={{gridTemplateColumns:'repeat(4,minmax(0,1fr))',marginBottom:17}}>
      <Metric label="Discharges in queue" value={encounters.length} foot={`Across ${new Set(encounters.map(item=>item.serviceLine)).size} service lines`} icon={<UsersRound size={15}/>} />
      <Metric label="High risk" value={high} foot="Above 70% estimated risk" icon={<CircleAlert size={15}/>} tone="rust"/>
      <Metric label="Awaiting review" value={encounters.length-reviewed} foot={`${reviewed} marked reviewed`} icon={<FileSearch size={15}/>} tone="gold"/>
      <Metric label="Follow-up arranged" value={`${Math.round(encounters.filter(item=>item.followUpScheduled).length/encounters.length*100)}%`} foot="Documented before discharge" icon={<CalendarDays size={15}/>} />
    </div>
    <div className="section-grid" style={{gridTemplateColumns:'minmax(0,1.55fr) minmax(275px,.8fr)',marginBottom:17}}>
      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Risk distribution</div><div className="panel-meta">Current synthetic discharge queue · {encounters.length} encounters</div></div><div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:'#79857f'}}><ListFilter size={13}/> Sorted by risk</div></div>
        <div style={{padding:'8px 19px 15px'}}>
          {(['High','Elevated','Moderate','Low'] as const).map(band=>{
            const count=encounters.filter(item=>item.riskBand===band).length;
            const width=Math.max(5,count/encounters.length*100);
            return <div key={band} style={{display:'grid',gridTemplateColumns:'83px 1fr 45px',alignItems:'center',gap:10,padding:'8px 0'}}>
              <RiskBadge band={band}/><div className="risk-track" style={{height:7}}><div className={`risk-fill ${band.toLowerCase()}`} style={{width:`${width}%`}}/></div><span className="mono" style={{fontSize:10,color:'#61716a',textAlign:'right'}}>{count} <span style={{color:'#9aa39b'}}>· {Math.round(count/encounters.length*100)}%</span></span>
            </div>;
          })}
          <div style={{borderTop:'1px solid #eeebe4',paddingTop:12,marginTop:4,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:10,color:'#839088'}}>Risk bands are illustrative review-priority groupings.</span>
            <Link href="/patients" style={{fontSize:10,color:'#3e7471',fontWeight:700,textDecoration:'none',display:'flex',alignItems:'center',gap:3}} data-testid="link-view-all-queue">View queue <ChevronRight size={12}/></Link>
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Transition follow-through</div><div className="panel-meta">Quick checks before the next handoff</div></div><span className="badge risk-elevated">{encounters.filter(item=>!item.reviewed).length} to review</span></div>
        <div style={{padding:'13px 17px'}}>
          <div className="handoff-check"><span>Follow-up documented</span><strong>{encounters.filter(item=>item.followUpScheduled).length} / {encounters.length}</strong></div>
          <div className="handoff-check"><span>Home / home health plans</span><strong>{encounters.filter(item=>item.disposition==='Home'||item.disposition==='Home health').length}</strong></div>
          <div className="handoff-check"><span>Discharge queue</span><strong>{encounters.length} encounters</strong></div>
          <Link href="/patients/new" className="workflow-add-link" data-testid="link-start-intake">Start a new synthetic intake <ChevronRight size={13}/></Link>
        </div>
      </section>
    </div>
    <div className="section-grid" style={{gridTemplateColumns:'minmax(0,1fr)',gap:16}}>
      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Encounters to review</div><div className="panel-meta">Highest synthetic estimate first · select a patient code to inspect history and handoff details</div></div><div style={{display:'flex',gap:7}}><Link href="/patients/new" className="button button-primary" data-testid="button-add-patient-queue"><UserPlus size={13}/>Add patient</Link><Link href="/patients" className="button" data-testid="button-queue-more">Full queue <ChevronRight size={13}/></Link></div></div>
        <div className="table-wrap">
          <table className="queue-table"><thead><tr><th>Patient code</th><th>Primary diagnosis</th><th>Service</th><th>Risk</th><th>Discharged</th><th>Review</th></tr></thead>
            <tbody>{sorted.slice(0,4).map(encounter=><tr key={encounter.encounterId} tabIndex={0} aria-selected={selected.encounterId===encounter.encounterId} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(encounter.encounterId)}}} className={`queue-row ${selected.encounterId===encounter.encounterId?'selected':''}`} onClick={()=>onSelect(encounter.encounterId)} data-testid={`row-priority-${encounter.encounterId}`}>
              <td><span className="patient-code">{encounter.patientId}</span></td><td style={{fontWeight:600}}>{encounter.primaryDiagnosis}</td><td>{encounter.serviceLine}</td><td><div style={{display:'flex',alignItems:'center',gap:8}}><RiskBadge band={encounter.riskBand}/><span className="mono" style={{fontSize:10}}>{Math.round(encounter.riskProbability*100)}%</span></div></td><td style={{color:'#77847d'}}>{encounter.dischargeTime}</td><td><span style={{fontSize:10,color:encounter.reviewed?'#548078':'#a17c43',fontWeight:700}}>{encounter.reviewed?'Reviewed':'Pending'}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:7,margin:'3px 0 10px',color:'#506e69'}}><Sparkles size={14}/><span style={{fontFamily:'Manrope',fontSize:12,fontWeight:800}}>Reference history example · SYN-1048</span><span className="mono" style={{fontSize:9,color:'#89938c'}}>FIXED DEMO SAMPLE</span></div>
        <section className="panel">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',background:'#f0f1e9',borderBottom:'1px solid #e4e4d9',borderRadius:'13px 13px 0 0'}}>
            <div><div style={{fontSize:10,color:'#71807a'}}>Historical readmission rate · SYN-1048 sample</div><div className="display" style={{fontSize:25,fontWeight:800,color:'#315b58',marginTop:2}}>{Math.round(ragFeature.historicalReadmissionRate*100)}%</div></div>
            <div style={{textAlign:'right'}}><div className="mono" style={{fontSize:12,color:'#3c5c57'}}>{ragFeature.neighborsRetrieved} neighbors</div><div style={{fontSize:9,color:'#89948c',marginTop:3}}>matched by similarity</div></div>
          </div>
          {ragFeature.neighborCases.slice(0,3).map(item=><div className="neighbor-card" key={item.encounterId}><div className="neighbor-top"><span className="patient-code">{item.encounterId}</span><span className="mono" style={{fontSize:9,color:'#7d8a83'}}>{Math.round(item.similarity*100)}% match</span></div><div style={{fontSize:11,fontWeight:700,color:'#40534e',marginTop:5}}>{item.diagnosis}</div><div style={{display:'flex',alignItems:'center',gap:6,fontSize:9,color:'#829087',marginTop:5}}><span className={`badge ${item.outcome==='readmitted'?'risk-high':'risk-low'}`}>{item.outcome==='readmitted'?(item.daysToReadmission===null?'Readmitted':`Readmitted · day ${item.daysToReadmission}`):'No readmission'}</span></div></div>)}
          <div style={{padding:'10px 15px',fontSize:9,color:'#8a948d',borderTop:'1px solid #eeebe4'}}><FileSearch size={11} style={{display:'inline',verticalAlign:'-2px',marginRight:5}}/>Synthetic historical examples; not patient records.</div>
        </section>
      </div>
    </div>
    <div style={{marginTop:15}}><EncounterDetails encounter={selected} encounters={encounters} onToggleReviewed={onToggleReviewed}/></div>
    <section className="panel secondary-model-summary" style={{marginTop:15}}>
      <div className="panel-head"><div><div className="panel-title">Evaluation results <span style={{fontWeight:500,color:'#87918b'}}>· secondary reference</span></div><div className="panel-meta">{best.modelName} · synthetic validation metrics</div></div><Link href="/models" className="button" data-testid="link-model-comparison">Compare models <ChevronRight size={13}/></Link></div>
      <div className="compact-metrics"><CompactMetric label="AUROC" value={best.aucRoc.toFixed(3)}/><CompactMetric label="F1" value={best.f1.toFixed(3)}/><CompactMetric label="Recall" value={best.recall.toFixed(3)}/></div>
    </section>
  </main>;
}

function Metric({label,value,foot,icon,tone}:{label:string;value:string|number;foot:string;icon:ReactNode;tone?:string}) {
 return <div className="metric-tile"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div className="metric-label">{label}</div><div style={{color:tone==='rust'?'#ad6656':tone==='gold'?'#a78146':'#648783'}}>{icon}</div></div><div className="metric-value">{value}</div><div className="metric-foot">{foot}</div></div>;
}
function CompactMetric({label,value}:{label:string;value:string}){return <div style={{background:'#f2f0e9',borderRadius:8,padding:'9px 10px'}}><div className="metric-label" style={{fontSize:8}}>{label}</div><div className="mono" style={{fontSize:15,fontWeight:500,color:'#355a56',marginTop:4}}>{value}</div></div>}
