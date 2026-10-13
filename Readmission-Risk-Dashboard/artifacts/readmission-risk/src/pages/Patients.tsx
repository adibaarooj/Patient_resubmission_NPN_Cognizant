import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ClipboardCheck, UserPlus } from 'lucide-react';
import type { Encounter } from '../data';
import { EncounterDetails, RiskBadge } from '../components/Clinical';
import { Link } from 'wouter';

type Props={encounters:Encounter[];selected:Encounter;onSelect:(id:string)=>void;onToggleReviewed:(id:string)=>void;autoRevealEncounterId?:string|null;onDetailRevealed?:()=>void};
export function Patients({encounters,selected,onSelect,onToggleReviewed,autoRevealEncounterId,onDetailRevealed}:Props) {
  const [query,setQuery]=useState('');
  const [risk,setRisk]=useState('All risk levels');
  const [service,setService]=useState('All services');
  const [review,setReview]=useState('All review states');
  const filtered=useMemo(()=>encounters.filter(item=>{
    const q=query.trim().toLowerCase();
    return (!q||[item.patientId,item.encounterId,item.primaryDiagnosis,item.serviceLine].some(value=>value.toLowerCase().includes(q)))
      &&(risk==='All risk levels'||item.riskBand===risk)
      &&(service==='All services'||item.serviceLine===service)
      &&(review==='All review states'||(review==='Awaiting review'?!item.reviewed:item.reviewed));
  }).sort((a,b)=>b.riskProbability-a.riskProbability),[encounters,query,risk,service,review]);
  const clear=()=>{setQuery('');setRisk('All risk levels');setService('All services');setReview('All review states')};
  const hasFilters=query||risk!=='All risk levels'||service!=='All services'||review!=='All review states';
  useEffect(()=>{
    if(autoRevealEncounterId&&autoRevealEncounterId===selected.encounterId){
      requestAnimationFrame(()=>document.getElementById('selected-encounter-details')?.scrollIntoView({behavior:'smooth',block:'start'}));
      onDetailRevealed?.();
    }
  },[autoRevealEncounterId,selected.encounterId,onDetailRevealed]);
  return <main className="content animate-in">
    <div className="page-heading"><div><div className="eyebrow">Hospital discharge team <span style={{padding:'0 6px',color:'#c7b99f'}}>/</span> Encounter review</div><h1 className="page-title">Discharge queue</h1><div className="subtitle">Review the handoff, look up synthetic prior admissions, and mark encounters reviewed.</div></div><div className="queue-heading-actions"><div className="badge risk-low"><ClipboardCheck size={12}/>{encounters.filter(item=>item.reviewed).length} reviewed</div><Link href="/patients/new" className="button button-primary" data-testid="button-add-patient-queue-top"><UserPlus size={14}/>Add patient</Link></div></div>
    <section className="panel">
      <div className="panel-head" style={{flexWrap:'wrap',gap:10}}>
        <div><div className="panel-title">All encounters <span className="mono" style={{fontSize:10,fontWeight:500,color:'#829089',marginLeft:5}}>{filtered.length} of {encounters.length}</span></div><div className="panel-meta">Select a row to review encounter details</div></div>
        <div className="filters" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <label className="search-box"><Search size={14}/><input aria-label="Search encounters" type="search" placeholder="Search code, diagnosis, service" value={query} onChange={event=>setQuery(event.target.value)} data-testid="input-queue-search"/></label>
          <Select value={risk} onChange={setRisk} label="Risk filter" items={['All risk levels','High','Elevated','Moderate','Low']} testId="select-risk-filter"/>
          <Select value={service} onChange={setService} label="Service filter" items={['All services',...Array.from(new Set(encounters.map(item=>item.serviceLine)))]} testId="select-service-filter"/>
          <Select value={review} onChange={setReview} label="Review filter" items={['All review states','Awaiting review','Reviewed']} testId="select-review-filter"/>
        </div>
      </div>
      {hasFilters&&<div style={{padding:'9px 17px',borderBottom:'1px solid #eeebe4',display:'flex',alignItems:'center',gap:8,fontSize:10,color:'#7e8982'}}><SlidersHorizontal size={12}/> Filters active <button type="button" className="button button-quiet" style={{padding:'4px 7px',fontSize:10}} onClick={clear} data-testid="button-clear-filters"><X size={12}/>Clear</button></div>}
      <div className="table-wrap">
        <table className="queue-table">
          <thead><tr><th>Patient / encounter</th><th>Primary diagnosis</th><th>Service line</th><th>Discharge</th><th>Risk estimate</th><th>Prior admits</th><th>Review</th></tr></thead>
          <tbody>{filtered.map(item=><tr key={item.encounterId} tabIndex={0} aria-selected={selected.encounterId===item.encounterId} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(item.encounterId)}}} onClick={()=>onSelect(item.encounterId)} className={`queue-row ${selected.encounterId===item.encounterId?'selected':''}`} data-testid={`row-encounter-${item.encounterId}`}>
            <td><div className="patient-code">{item.patientId}</div><div className="mono" style={{fontSize:9,color:'#98a099',marginTop:4}}>{item.encounterId}</div></td>
            <td><div style={{fontWeight:700,color:'#40524f'}}>{item.primaryDiagnosis}</div><div style={{fontSize:10,color:'#8a948d',marginTop:4}}>{item.age} y · {item.sex} · {item.lengthOfStay} day stay</div></td>
            <td>{item.serviceLine}</td><td style={{whiteSpace:'nowrap',color:'#77847d'}}>{item.dischargeTime}</td>
            <td><div style={{display:'flex',alignItems:'center',gap:8}}><RiskBadge band={item.riskBand}/><span className="mono" style={{fontSize:10,color:'#61716a'}}>{Math.round(item.riskProbability*100)}%</span></div></td>
            <td className="mono">{item.priorAdmissions12m}</td>
            <td><span style={{fontSize:10,fontWeight:700,color:item.reviewed?'#548078':'#a17c43'}}>{item.reviewed?'Reviewed':'Pending'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
      {filtered.length===0&&<div style={{padding:'42px 18px',textAlign:'center'}}><div style={{margin:'0 auto 10px',width:36,height:36,borderRadius:11,display:'grid',placeItems:'center',background:'#eeeee6',color:'#75837b'}}><Search size={16}/></div><div style={{fontFamily:'Manrope',fontWeight:800,fontSize:13,color:'#40534e'}}>No encounters match these filters</div><div style={{fontSize:11,color:'#87918a',marginTop:4}}>Try another search or clear the selected filters.</div><button type="button" className="button" style={{marginTop:12}} onClick={clear} data-testid="button-empty-clear-filters">Clear filters</button></div>}
      <div style={{borderTop:'1px solid #eeebe4',padding:'10px 16px',fontSize:10,color:'#8a948d',display:'flex',justifyContent:'space-between'}}><span>Showing {filtered.length} synthetic encounters</span><span>Sorted by estimated risk, highest first</span></div>
    </section>
    <div style={{marginTop:16}}>
      {selected&&filtered.some(item=>item.encounterId===selected.encounterId)?<div id="selected-encounter-details"><EncounterDetails encounter={selected} encounters={encounters} onToggleReviewed={onToggleReviewed}/></div>:<div className="panel" style={{padding:19,fontSize:11,color:'#7f8a83'}}>Select a row to open encounter details.</div>}
    </div>
  </main>;
}

function Select({value,onChange,label,items,testId}:{value:string;onChange:(value:string)=>void;label:string;items:string[];testId:string}) {
 return <div style={{position:'relative'}}><select aria-label={label} className="filter-select" value={value} onChange={event=>onChange(event.target.value)} data-testid={testId}>{items.map(item=><option value={item} key={item}>{item}</option>)}</select><ChevronDown size={12} style={{position:'absolute',right:10,top:13,pointerEvents:'none',color:'#849088'}}/></div>;
}
