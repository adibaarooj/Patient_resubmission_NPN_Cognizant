import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CircleHelp, ClipboardPlus, Database, History, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Encounter } from '../data';
import { countAdmissionsInPastYear, estimateDemoRisk, getEncounterHistory } from '../data';
import type { HistoryRecord } from '../data';

const wholeNumber=(min:number,max:number,label:string)=>z.string().regex(/^\d+$/,`Enter ${label} as a whole number.`).refine(value=>Number(value)>=min,`Minimum value is ${min}.`).refine(value=>Number(value)<=max,`Maximum value is ${max}.`);

const intakeSchema=z.object({
  patientId:z.string().trim().regex(/^SYN-\d{4}$/i,'Use a fictional code in the format SYN-1048.'),
  age:wholeNumber(18,110,'age'),
  sex:z.string().min(1,'Choose an option.'),
  serviceLine:z.string().min(1,'Choose a service line.'),
  primaryDiagnosis:z.string().trim().min(3,'Enter a diagnosis.').max(120,'Keep diagnosis under 120 characters.'),
  lengthOfStay:wholeNumber(1,90,'length of stay'),
  priorAdmissions12m:wholeNumber(0,20,'prior admissions'),
  edVisits12m:wholeNumber(0,30,'ED visits'),
  comorbidityCount:wholeNumber(0,30,'comorbidity count'),
  disposition:z.string().min(1,'Choose a discharge disposition.'),
  followUpScheduled:z.enum(['yes','no']),
});
type IntakeValues=z.input<typeof intakeSchema>;
type Props={encounters:Encounter[];onSave:(encounter:Encounter)=>void};

export function NewPatient({encounters,onSave}:Props) {
  const form=useForm<IntakeValues>({
    resolver:zodResolver(intakeSchema),
    defaultValues:{patientId:'',age:'65',sex:'',serviceLine:'',primaryDiagnosis:'',lengthOfStay:'3',priorAdmissions12m:'0',edVisits12m:'0',comorbidityCount:'0',disposition:'',followUpScheduled:'yes'},
    mode:'onBlur',
  });
  const values=useWatch({control:form.control});
  const patientCode=String(values.patientId??'').trim().toUpperCase();
  const matchingHistory=useMemo(()=>getEncounterHistory(patientCode,encounters),[patientCode,encounters]);
  useEffect(()=>{
    if(/^SYN-\d{4}$/.test(patientCode)){
      form.setValue('priorAdmissions12m',String(countAdmissionsInPastYear(patientCode,encounters)),{shouldValidate:true});
    }
  },[patientCode,encounters,form.setValue]);
  const completeForEstimate=Boolean(values.age&&values.lengthOfStay&&values.sex&&values.serviceLine&&values.primaryDiagnosis&&values.disposition&&values.followUpScheduled);
  const estimate=useMemo(()=>estimateDemoRisk({
    age:Number(values.age)||0,
    lengthOfStay:Number(values.lengthOfStay)||0,
    priorAdmissions12m:Number(values.priorAdmissions12m)||0,
    edVisits12m:Number(values.edVisits12m)||0,
    comorbidityCount:Number(values.comorbidityCount)||0,
    followUpScheduled:values.followUpScheduled==='yes',
  },matchingHistory),[values.age,values.lengthOfStay,values.priorAdmissions12m,values.edVisits12m,values.comorbidityCount,values.followUpScheduled,matchingHistory]);

  const submit=(data:IntakeValues)=>{
    const age=Number(data.age);
    const lengthOfStay=Number(data.lengthOfStay);
    const priorAdmissions12m=Number(data.priorAdmissions12m);
    const edVisits12m=Number(data.edVisits12m);
    const comorbidityCount=Number(data.comorbidityCount);
    const risk=estimateDemoRisk({
      age,lengthOfStay,priorAdmissions12m,
      edVisits12m,comorbidityCount,followUpScheduled:data.followUpScheduled==='yes',
    },getEncounterHistory(data.patientId,encounters));
    const now=new Date();
    const encounter:Encounter={
      encounterId:`ENC-${Date.now()}`,
      patientId:data.patientId.toUpperCase(),
       age,sex:data.sex,serviceLine:data.serviceLine,primaryDiagnosis:data.primaryDiagnosis,
      dischargeTime:`${new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(now)}, ${now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`,
      dischargeDate:now.toISOString().slice(0,10),
       lengthOfStay,priorAdmissions12m,edVisits12m,
       comorbidityCount,disposition:data.disposition,followUpScheduled:data.followUpScheduled==='yes',
      riskProbability:risk.riskProbability,riskBand:risk.riskBand,riskFactors:risk.riskFactors,riskSource:'demo-heuristic',
      reviewed:false,readmissionWithin30Days:null,
      noteSummary:'Synthetic discharge intake captured in this browser prototype.',
    };
    onSave(encounter);
  };

  return <main className="content animate-in">
    <div className="page-heading">
      <div><div className="eyebrow">Discharge workflow <span style={{padding:'0 6px',color:'#c7b99f'}}>/</span> New intake</div><h1 className="page-title">Add patient</h1><div className="subtitle">Capture a fictional discharge encounter, check local demo history, and review an illustrative estimate.</div></div>
      <Link href="/patients" className="button" data-testid="link-cancel-intake"><ArrowLeft size={14}/>Back to queue</Link>
    </div>
    <div className="intake-notice" role="note"><ShieldAlert size={16}/><div><strong>Use synthetic codes only.</strong> Do not enter names, dates of birth, medical record numbers, or any real patient information. This demo stores entries only in this browser.</div></div>
    <div className="intake-layout">
      <section className="panel intake-panel">
        <div className="panel-head"><div><div className="panel-title">Encounter intake</div><div className="panel-meta">Required fields are marked with an asterisk</div></div><span className="badge risk-low"><ClipboardPlus size={12}/>Local prototype</span></div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} noValidate>
            <div className="intake-form-grid">
              <div className="intake-section-label">Patient code</div>
              <FormField control={form.control} name="patientId" render={({field})=><FormItem className="intake-field intake-field-wide">
                <FormLabel>Fictional patient code *</FormLabel><FormControl><Input {...field} autoComplete="off" placeholder="SYN-1048" className="form-input" data-testid="input-patient-code" aria-describedby="patient-code-guidance"/></FormControl>
                <FormDescription id="patient-code-guidance">Use a demo code only, for example SYN-1048. No name, DOB, or MRN.</FormDescription><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="age" render={({field})=><FormItem className="intake-field">
                <FormLabel>Age *</FormLabel><FormControl><Input type="number" min={18} max={110} {...field} onChange={event=>field.onChange(event.target.value)} className="form-input" data-testid="input-age"/></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="sex" render={({field})=><FormItem className="intake-field">
                <FormLabel>Sex *</FormLabel><FormControl><select {...field} className="form-select" data-testid="select-sex"><option value="">Select</option><option>Female</option><option>Male</option><option>Intersex</option><option>Not recorded</option></select></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="serviceLine" render={({field})=><FormItem className="intake-field">
                <FormLabel>Service line *</FormLabel><FormControl><select {...field} className="form-select" data-testid="select-service-line"><option value="">Select service</option><option>Cardiology</option><option>Hospital Medicine</option><option>Endocrinology</option><option>Pulmonary</option><option>General Surgery</option><option>Orthopedics</option><option>Neurology</option><option>Other</option></select></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="primaryDiagnosis" render={({field})=><FormItem className="intake-field intake-field-wide">
                <FormLabel>Primary diagnosis *</FormLabel><FormControl><Input {...field} placeholder="e.g. Acute on chronic heart failure" className="form-input" data-testid="input-diagnosis"/></FormControl><FormMessage/>
              </FormItem>}/>
              <div className="intake-section-label">Recent utilization &amp; discharge plan</div>
              <FormField control={form.control} name="lengthOfStay" render={({field})=><FormItem className="intake-field">
                <FormLabel>Length of stay · days *</FormLabel><FormControl><Input type="number" min={1} max={90} {...field} onChange={event=>field.onChange(event.target.value)} className="form-input" data-testid="input-length-of-stay"/></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="priorAdmissions12m" render={({field})=><FormItem className="intake-field">
                <FormLabel>Prior admissions · 12 months</FormLabel><FormControl><Input type="number" min={0} max={20} {...field} onChange={event=>field.onChange(event.target.value)} className="form-input" data-testid="input-prior-admissions"/></FormControl><FormDescription>Prefilled from this demo history when available; adjust to include any additional known admissions.</FormDescription><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="edVisits12m" render={({field})=><FormItem className="intake-field">
                <FormLabel>ED visits · 12 months</FormLabel><FormControl><Input type="number" min={0} max={30} {...field} onChange={event=>field.onChange(event.target.value)} className="form-input" data-testid="input-ed-visits"/></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="comorbidityCount" render={({field})=><FormItem className="intake-field">
                <FormLabel>Comorbidity count</FormLabel><FormControl><Input type="number" min={0} max={30} {...field} onChange={event=>field.onChange(event.target.value)} className="form-input" data-testid="input-comorbidity-count"/></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="disposition" render={({field})=><FormItem className="intake-field">
                <FormLabel>Discharge disposition *</FormLabel><FormControl><select {...field} className="form-select" data-testid="select-disposition"><option value="">Select disposition</option><option>Home</option><option>Home health</option><option>Skilled nursing</option><option>Rehabilitation facility</option><option>Other</option></select></FormControl><FormMessage/>
              </FormItem>}/>
              <FormField control={form.control} name="followUpScheduled" render={({field})=><FormItem className="intake-field">
                <FormLabel>Follow-up scheduled? *</FormLabel><FormControl><select {...field} className="form-select" data-testid="select-follow-up"><option value="yes">Yes</option><option value="no">No</option></select></FormControl><FormMessage/>
              </FormItem>}/>
            </div>
            <div className="intake-submit-row"><div className="intake-storage-copy"><Database size={13}/>Saved to localStorage in this browser only</div><button className="button button-primary" type="submit" data-testid="button-save-encounter"><ClipboardPlus size={14}/>Save &amp; review encounter</button></div>
          </form>
        </Form>
      </section>
      <aside className="intake-aside">
        <section className="panel">
          <div className="panel-head"><div><div className="panel-title" style={{display:'flex',alignItems:'center',gap:7}}><History size={15} color="#63847c"/>Synthetic prior admissions</div><div className="panel-meta">Local history lookup · {patientCode||'enter a patient code'}</div></div><span className="mono" style={{fontSize:9,color:'#87928a'}}>{matchingHistory.length} MATCH{matchingHistory.length===1?'':'ES'}</span></div>
          {matchingHistory.length>0?<div className="history-list" aria-live="polite">{matchingHistory.map(record=><HistoryItem key={record.historyId} record={record}/>)}</div>:<div className="history-empty" data-testid="status-no-history" aria-live="polite"><div className="history-empty-icon"><CircleHelp size={16}/></div><div style={{fontSize:11,fontWeight:700,color:'#53645e'}}>{patientCode?'No history in this demo dataset':'History appears when you enter a code'}</div><div style={{fontSize:10,lineHeight:1.55,color:'#849089',marginTop:5}}>{patientCode?'An empty result here does not mean there is no real-world history. This browser prototype contains only a small synthetic sample.':'Enter a fictional SYN-#### code to look up synthetic admissions and saved encounters.'}</div></div>}
          {patientCode&&matchingHistory.length>0&&<div className="history-disclaimer">A match is synthetic demo data only. An empty lookup never indicates absence of real-world history.</div>}
        </section>
        <section className="panel estimate-preview" data-testid="panel-demo-risk-preview" aria-live="polite">
          <div className="panel-head"><div><div className="panel-title" style={{display:'flex',alignItems:'center',gap:7}}><Sparkles size={14} color="#a57a4e"/>Illustrative risk estimate</div><div className="panel-meta">Computed locally from entered fields + demo history</div></div><span className={`badge risk-${estimate.riskBand.toLowerCase()}`}>{estimate.riskBand}</span></div>
          <div style={{padding:'15px 17px'}}>
            <div style={{display:'flex',alignItems:'baseline',gap:7}}><span className="display estimate-number" data-testid="text-demo-risk-score">{completeForEstimate?`${Math.round(estimate.riskProbability*100)}%`:'—'}</span><span style={{fontSize:10,color:'#829087'}}>30-day readmission likelihood</span></div>
            <div className="risk-track" style={{height:8,marginTop:8}}><div className={`risk-fill ${estimate.riskBand.toLowerCase()}`} style={{width:completeForEstimate?`${estimate.riskProbability*100}%`:'0%'}}/></div>
            <div className="factor-list"><div className="detail-label">Main contributing factors</div>{completeForEstimate?estimate.riskFactors.map(factor=><div key={factor} className="factor-item"><span className="factor-dot"/>{factor}</div>):<div className="factor-item">Complete required intake fields to see the estimate.</div>}</div>
            <div className="heuristic-disclosure"><strong>Demo heuristic, not a trained model.</strong> Starts at 8%; adds 12 points for age 75+ (8 for 65–74), 9 per prior admission (cap 24), 3.5 per ED visit (cap 14), and 2.5 per comorbidity (cap 15); stay adds 4 or 8, no follow-up adds 8, and known demo-history readmission rate adds up to 24 points. Capped at 94%. Not clinical guidance.</div>
          </div>
        </section>
      </aside>
    </div>
  </main>;
}

function HistoryItem({record}:{record:HistoryRecord}) {
  const date=record.dischargeDate;
  const formatted=Number.isNaN(Date.parse(date))?date:new Intl.DateTimeFormat('en',{year:'numeric',month:'short',day:'numeric'}).format(new Date(`${date}T12:00:00`));
  return <div className="history-entry" data-testid={`history-record-${record.historyId}`}>
    <div className="history-entry-heading"><div style={{display:'flex',alignItems:'center',gap:7}}><span className="mono" style={{fontSize:10,color:'#4e716b'}}>{formatted}</span><span className="history-source">{record.source==='saved-encounter'?'Saved encounter':'Demo history'}</span></div><span className={`badge ${record.readmissionWithin30Days===true?'risk-high':record.readmissionWithin30Days===false?'risk-low':'risk-elevated'}`}>{record.readmissionWithin30Days===true?'Readmitted ≤30 days':record.readmissionWithin30Days===false?'No readmission ≤30 days':'Outcome not recorded'}</span></div>
    <div style={{fontSize:11,fontWeight:700,color:'#475a54',marginTop:6}}>{record.diagnosis}</div>
    {record.outcomeNote&&<div style={{fontSize:9,color:'#89928b',marginTop:4}}>{record.outcomeNote}</div>}
  </div>;
}
