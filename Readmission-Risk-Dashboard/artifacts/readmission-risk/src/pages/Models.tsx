import { useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, ArrowRight, BookOpenText, Check, Database, Info, Layers3, ScanSearch, TrendingUp } from 'lucide-react';
import { modelMetrics, ragFeature } from '../data';

const metricDefinitions=[
  {key:'aucRoc' as const,label:'AUROC',meaning:'Ranking ability across thresholds',format:'Area under ROC'},
  {key:'f1' as const,label:'F1 score',meaning:'Balance of precision and recall',format:'Harmonic mean'},
  {key:'precision' as const,label:'Precision',meaning:'Positive predictions that were readmissions',format:'Positive predictive value'},
  {key:'recall' as const,label:'Recall',meaning:'Readmissions identified by the model',format:'Sensitivity'},
];

export function Models() {
  const [selected,setSelected]=useState(modelMetrics[3].modelName);
  const chosen=modelMetrics.find(model=>model.modelName===selected)??modelMetrics[3];
  return <main className="content animate-in">
    <div className="page-heading"><div><div className="eyebrow">Research workspace <span style={{padding:'0 6px',color:'#c7b99f'}}>/</span> Validation set</div><h1 className="page-title">Model evaluation</h1><div className="subtitle">Compare candidate approaches for synthetic 30-day readmission classification.</div></div><div className="badge risk-elevated"><Activity size={12}/>Offline evaluation</div></div>
    <section className="panel" style={{marginBottom:16}}>
      <div className="panel-head"><div><div className="panel-title">Validation performance</div><div className="panel-meta">Same held-out cohort · threshold and prevalence affect operating behavior</div></div><span className="mono" style={{fontSize:9,color:'#8a948d'}}>SYNTHETIC EXPERIMENT</span></div>
      <div style={{display:'flex',overflowX:'auto',borderBottom:'1px solid #ebe7df',padding:'0 11px'}}>
        {modelMetrics.map((model,index)=><button type="button" key={model.modelName} className={`model-tab ${selected===model.modelName?'selected':''}`} onClick={()=>setSelected(model.modelName)} data-testid={`button-model-${index}`} aria-pressed={selected===model.modelName}>{model.modelName}</button>)}
      </div>
      <div className="detail-layout" style={{padding:18,gridTemplateColumns:'minmax(0,1.3fr) minmax(245px,.7fr)'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><div style={{width:33,height:33,display:'grid',placeItems:'center',background:'#e8efea',color:'#527e77',borderRadius:9}}><Layers3 size={17}/></div><div><div className="panel-title">{chosen.modelName}</div><div className="panel-meta">Selected validation profile</div></div></div>
          {metricDefinitions.map(metric=><div key={metric.key} className="bar-row">
            <div><div style={{fontSize:11,fontWeight:700,color:'#40534e'}}>{metric.label}</div><div style={{fontSize:9,color:'#8b948d',marginTop:2}}>{metric.meaning}</div></div>
            <div className="bar-bg"><div className="bar-fill" style={{width:`${chosen[metric.key]*100}%`,background:metric.key==='aucRoc'?'#53807a':metric.key==='recall'?'#879b79':'#b58a58'}}/></div>
            <span className="mono" style={{fontSize:12,textAlign:'right',color:'#3f625d'}}>{chosen[metric.key].toFixed(3)}</span>
          </div>)}
        </div>
        <aside style={{padding:'15px 16px',background:'#f2f0e9',borderRadius:10,alignSelf:'start'}}>
          <div className="eyebrow">How to read these metrics</div>
          <div style={{fontSize:11,lineHeight:1.65,color:'#697871',marginTop:9}}>AUROC summarizes ranking across possible thresholds. Precision and recall describe a chosen classification threshold; neither alone indicates clinical utility.</div>
          <div style={{display:'flex',gap:7,alignItems:'flex-start',fontSize:10,lineHeight:1.5,color:'#8a7658',marginTop:12,paddingTop:10,borderTop:'1px solid #e2ddd1'}}><Info size={13} style={{flex:'0 0 auto',marginTop:1}}/>Metric values are illustrative synthetic results, not a validated or deployed model.</div>
        </aside>
      </div>
    </section>
    <section className="panel" style={{marginBottom:16}}>
      <div className="panel-head"><div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:31,height:31,display:'grid',placeItems:'center',background:'#efe8dc',color:'#997148',borderRadius:9}}><ScanSearch size={16}/></div><div><div className="panel-title">Retrieved-neighbor readmission feature</div><div className="panel-meta">Clinical Transformer + RAG · feature construction</div></div></div><span className="badge risk-elevated">Engineered input</span></div>
      <div style={{padding:18}}>
        <div className="section-grid" style={{gridTemplateColumns:'minmax(0,1.25fr) minmax(240px,.75fr)',gap:20}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:700,color:'#415751'}}><BookOpenText size={14} color="#5c827a"/> Historical rate becomes a numeric model feature</div>
            <div style={{fontSize:11,color:'#75817a',lineHeight:1.65,marginTop:8}}>For an encounter, the retrieval step selects the most similar historical examples using the feature representation. The proportion of those neighbors with a 30-day readmission outcome is then calculated and appended as a scalar feature to the transformer representation. It is not a separate prediction or a generated recommendation.</div>
            <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap',marginTop:14}}>
              <FormulaStep icon={<Database size={14}/>} title={`${ragFeature.neighborsRetrieved} similar cases`} detail="retrieved examples"/>
              <ArrowRight size={13} color="#a69c8b"/>
              <FormulaStep icon={<TrendingUp size={14}/>} title={`${Math.round(ragFeature.historicalReadmissionRate*100)}% observed rate`} detail="readmitted neighbors"/>
              <ArrowRight size={13} color="#a69c8b"/>
              <FormulaStep icon={<Layers3 size={14}/>} title="One scalar feature" detail="concatenated to model input"/>
            </div>
          </div>
          <div style={{border:'1px solid #e8e3d9',borderRadius:10,padding:14}}>
            <div className="eyebrow">Illustrative neighbor outcomes</div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
              <div style={{width:82,height:82,borderRadius:'50%',background:`conic-gradient(#b5715d ${ragFeature.historicalReadmissionRate*360}deg,#e6e4d9 0)`,display:'grid',placeItems:'center',position:'relative'}}><div style={{width:62,height:62,borderRadius:'50%',background:'#fbfaf6',display:'grid',placeItems:'center'}}><span className="mono" style={{fontSize:13,color:'#345d57',fontWeight:500}}>{Math.round(ragFeature.historicalReadmissionRate*100)}%</span></div></div>
              <div><div style={{fontSize:11,color:'#475a53',fontWeight:700}}>3 of 5 readmitted</div><div style={{fontSize:10,color:'#87918a',marginTop:4}}>within the defined 30-day window</div><div style={{fontSize:9,color:'#9a8b74',marginTop:9}}>Outcome fraction = R / k</div></div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:7,alignItems:'flex-start',borderTop:'1px solid #eeebe4',paddingTop:12,marginTop:16,fontSize:10,color:'#818b84',lineHeight:1.5}}><Info size={13} style={{flex:'0 0 auto',marginTop:1}}/>In this prototype the displayed cases and feature value are fixed synthetic examples. No patient retrieval, inference, or external data call occurs.</div>
      </div>
    </section>
    <section className="panel">
      <div className="panel-head"><div><div className="panel-title">Side-by-side metrics</div><div className="panel-meta">Synthetic validation cohort · higher is not automatically better for every workflow</div></div><div className="badge risk-low"><Check size={12}/>4 candidates</div></div>
      <div className="table-wrap"><table className="queue-table" style={{minWidth:680}}>
        <thead><tr><th>Model candidate</th><th>AUROC</th><th>F1</th><th>Precision</th><th>Recall</th><th>Selected</th></tr></thead>
        <tbody>{modelMetrics.map(model=><tr key={model.modelName} onClick={()=>setSelected(model.modelName)} className={`queue-row ${selected===model.modelName?'selected':''}`} data-testid={`row-model-${model.modelName.toLowerCase().replaceAll(' ','-').replaceAll('+','plus')}`}>
          <td style={{fontWeight:700}}>{model.modelName}</td><td className="mono">{model.aucRoc.toFixed(3)}</td><td className="mono">{model.f1.toFixed(3)}</td><td className="mono">{model.precision.toFixed(3)}</td><td className="mono">{model.recall.toFixed(3)}</td><td>{selected===model.modelName?<span className="badge risk-low"><Check size={11}/>Viewing</span>:<span style={{fontSize:10,color:'#95a098'}}>Select row</span>}</td>
        </tr>)}</tbody>
      </table></div>
      <div style={{padding:'11px 16px',fontSize:10,color:'#8a948d',borderTop:'1px solid #eeebe4'}}>Candidate set: Logistic Regression, Random Forest, fine-tuned Clinical Transformer, and Clinical Transformer + RAG feature.</div>
    </section>
  </main>;
}

function FormulaStep({icon,title,detail}:{icon:ReactNode;title:string;detail:string}) {
 return <div style={{background:'#f2f0e9',border:'1px solid #e7e2d8',borderRadius:8,padding:'9px 11px',minWidth:125}}><div style={{display:'flex',alignItems:'center',gap:6,color:'#50766e'}}>{icon}<span style={{fontSize:10,fontWeight:700,color:'#435852'}}>{title}</span></div><div style={{fontSize:9,color:'#89928b',marginTop:4}}>{detail}</div></div>;
}
