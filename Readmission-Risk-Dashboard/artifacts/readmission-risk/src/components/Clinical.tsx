import { Check, ChevronRight, Clock3, FileHeart, Flag, HeartPulse, History, ShieldCheck } from 'lucide-react';
import type { Encounter, HistoryRecord } from '../data';
import { getEncounterHistory } from '../data';

export function RiskBadge({ band }: { band: Encounter['riskBand'] }) {
  return <span className={`badge risk-${band.toLowerCase()}`} data-testid={`status-risk-${band.toLowerCase()}`}><span style={{width:5,height:5,borderRadius:'50%',background:'currentColor'}}/>{band} risk</span>;
}

export function ReviewedButton({ encounter, onToggle }: { encounter: Encounter; onToggle: (id:string)=>void }) {
  return <button type="button" className={`button ${encounter.reviewed?'':'button-primary'}`} onClick={event=>{event.stopPropagation();onToggle(encounter.encounterId)}} data-testid={`button-reviewed-${encounter.encounterId}`} aria-pressed={encounter.reviewed}>
    {encounter.reviewed?<><Check size={14}/> Reviewed</>:<><ShieldCheck size={14}/> Mark reviewed</>}
  </button>;
}

export function EncounterDetails({ encounter, encounters, onToggleReviewed }: { encounter: Encounter; encounters:Encounter[]; onToggleReviewed:(id:string)=>void }) {
  const history=getEncounterHistory(encounter.patientId,encounters,encounter.encounterId);
  return <div className="detail-layout animate-in" data-testid={`detail-encounter-${encounter.encounterId}`}>
    <section className="panel">
      <div className="panel-head">
        <div><div className="eyebrow">Encounter snapshot</div><div className="panel-title" style={{marginTop:5}}>{encounter.primaryDiagnosis}</div><div className="panel-meta">{encounter.serviceLine} · Discharged {encounter.dischargeTime}</div></div>
        <RiskBadge band={encounter.riskBand}/>
      </div>
      <div style={{padding:'13px 19px 17px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:13,borderBottom:'1px solid #eeebe4',gap:12,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:35,height:35,borderRadius:10,display:'grid',placeItems:'center',background:'#e8eeea',color:'#4b7772'}}><FileHeart size={17}/></div><div><div className="patient-code">{encounter.patientId}</div><div style={{fontSize:10,color:'#89928b',marginTop:3}}>Fictional patient code · {encounter.age} years · {encounter.sex}</div></div></div>
          <ReviewedButton encounter={encounter} onToggle={onToggleReviewed}/>
        </div>
        <div className="section-grid" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:'0 19px',marginTop:5}}>
          <DetailField label="Length of stay" value={`${encounter.lengthOfStay} days`}/>
          <DetailField label="Prior admissions · 12m" value={`${encounter.priorAdmissions12m}`}/>
          <DetailField label="ED visits · 12m" value={`${encounter.edVisits12m}`}/>
          <DetailField label="Comorbidities" value={`${encounter.comorbidityCount} recorded`}/>
          <DetailField label="Disposition" value={encounter.disposition}/>
          <DetailField label="Follow-up" value={encounter.followUpScheduled?'Scheduled':'Not scheduled'}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:7,fontSize:10,color:'#71807a',margin:'14px 0 9px'}}><HeartPulse size={13} color="#608782"/> Discharge note summary</div>
        <div className="note-box">{encounter.noteSummary}</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,margin:'17px 0 9px'}}>
          <div style={{display:'flex',alignItems:'center',gap:7,fontSize:11,fontWeight:700,color:'#455b54'}}><History size={14} color="#608178"/>Prior admissions in demo dataset</div>
          <span className="mono" style={{fontSize:9,color:'#87918a'}}>{history.length} RECORD{history.length===1?'':'S'}</span>
        </div>
        {history.length>0?<div className="encounter-history-list">{history.map(record=><HistoryRow key={record.historyId} record={record}/>)}</div>:<div className="history-empty encounter-history-empty" data-testid={`status-no-encounter-history-${encounter.patientId}`}><strong>No prior history in this demo dataset.</strong> This does not mean there is no real-world history.</div>}
        {history.length>0&&<div className="history-disclaimer">Synthetic local examples only. An empty result is not evidence of no real-world history.</div>}
      </div>
    </section>
    <section className="panel">
      <div className="panel-head"><div><div className="eyebrow">Illustrative estimate</div><div className="panel-title" style={{marginTop:5}}>30-day readmission risk</div></div><span className="mono" style={{fontSize:10,color:'#7d8982'}}>{encounter.riskSource==='demo-heuristic'?'LOCAL HEURISTIC':'SYNTHETIC SEED'}</span></div>
      <div style={{padding:'18px 18px 16px'}}>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}><div className="display" style={{fontSize:42,fontWeight:800,color:'#a65040'}}>{Math.round(encounter.riskProbability*100)}%</div><div style={{fontSize:11,color:'#818a84'}}>estimated probability</div></div>
        <div className="risk-track" style={{height:8,marginTop:9}}><div className={`risk-fill ${encounter.riskBand.toLowerCase()}`} style={{width:`${encounter.riskProbability*100}%`}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#98a099',marginTop:6}}><span>0% · Lower</span><span>Threshold 35%</span><span>100%</span></div>
        <div style={{padding:'12px 13px',background:'#f3f1e9',borderRadius:9,marginTop:17}}>
          <div style={{display:'flex',alignItems:'center',gap:7,fontSize:11,fontWeight:700,color:'#405a56'}}><Flag size={13} color="#b07f4e"/> Main contributing factors</div>
          {encounter.riskFactors?.length?<ul className="risk-factor-list">{encounter.riskFactors.map(factor=><li key={factor}>{factor}</li>)}</ul>:<div style={{fontSize:10,lineHeight:1.55,color:'#748079',marginTop:6}}>Fixed synthetic seed score retained as supplied; no estimate was inferred for this encounter.</div>}
        </div>
        <div className="heuristic-disclosure" style={{marginTop:10}}><strong>Demo heuristic, not trained inference or clinical guidance.</strong> New intake starts at 8%; adds age +8–12, prior admissions +9 each (cap 24), ED visits +3.5 each (cap 14), comorbidities +2.5 each (cap 15), stay +4–8, no follow-up +8, and known demo readmission rate ×24 points; capped at 94%. Existing seed scores are unchanged. No clinical inference occurs.</div>
        <div style={{display:'flex',alignItems:'center',gap:6,color:'#849089',fontSize:10,marginTop:14}}><Clock3 size={12}/> Static synthetic estimate · no live inference</div>
      </div>
    </section>
  </div>;
}

function HistoryRow({record}:{record:HistoryRecord}) {
  const validDate=Date.parse(record.dischargeDate);
  const date=Number.isNaN(validDate)?record.dischargeDate:new Intl.DateTimeFormat('en',{year:'numeric',month:'short',day:'numeric'}).format(new Date(`${record.dischargeDate}T12:00:00`));
  return <div className="encounter-history-row" data-testid={`detail-history-${record.historyId}`}>
    <div><div className="mono" style={{fontSize:9,color:'#54766f'}}>{date}<span style={{fontFamily:'DM Sans',marginLeft:7,color:'#939b93'}}>{record.source==='saved-encounter'?'Saved encounter':'Demo history'}</span></div><div style={{fontSize:10,fontWeight:700,color:'#435650',marginTop:3}}>{record.diagnosis}</div></div>
    <span className={`badge ${record.readmissionWithin30Days===true?'risk-high':record.readmissionWithin30Days===false?'risk-low':'risk-elevated'}`}>{record.readmissionWithin30Days===true?'Readmitted ≤30d':record.readmissionWithin30Days===false?'No readmission ≤30d':'Outcome not recorded'}</span>
  </div>;
}

function DetailField({label,value}:{label:string;value:string}) {
  return <div className="detail-field"><div className="detail-label">{label}</div><div className="detail-value">{value}</div></div>;
}

export function SectionTitle({ icon:Icon, title, meta }: { icon: typeof ChevronRight; title:string; meta:string }) {
  return <div style={{display:'flex',alignItems:'center',gap:8}}><Icon size={15} color="#5d817a"/><div><div className="panel-title">{title}</div><div className="panel-meta">{meta}</div></div></div>;
}
