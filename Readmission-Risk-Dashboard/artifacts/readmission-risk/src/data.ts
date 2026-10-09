export type RiskBand = 'High' | 'Elevated' | 'Moderate' | 'Low';
export type Encounter = {
  encounterId: string; patientId: string; age: number; sex: string; serviceLine: string;
  primaryDiagnosis: string; dischargeTime: string; lengthOfStay: number; priorAdmissions12m: number;
  edVisits12m: number; comorbidityCount: number; disposition: string; followUpScheduled: boolean;
  riskProbability: number; riskBand: RiskBand; reviewed: boolean; noteSummary: string;
  dischargeDate?: string; readmissionWithin30Days?: boolean | null; riskFactors?: string[]; riskSource?: 'seed-example' | 'demo-heuristic';
};
export type HistoryRecord = { historyId:string; patientId:string; dischargeDate:string; diagnosis:string; readmissionWithin30Days:boolean|null; outcomeNote?:string; source?:'synthetic-history'|'saved-encounter' };
export type RiskInputs = Pick<Encounter,'age'|'lengthOfStay'|'priorAdmissions12m'|'edVisits12m'|'comorbidityCount'|'followUpScheduled'>;
export type DemoRiskEstimate = { riskProbability:number; riskBand:RiskBand; riskFactors:string[] };
export type RetrievedCase = { encounterId: string; similarity: number; diagnosis: string; outcome: 'readmitted' | 'not readmitted'; daysToReadmission: number | null; summary: string };
export type RagFeature = { neighborsRetrieved: number; historicalReadmissionRate: number; neighborCases: RetrievedCase[] };
export type ModelMetrics = { modelName: string; aucRoc: number; f1: number; precision: number; recall: number };

export const encounters: Encounter[] = [
  { encounterId:'ENC-48291',patientId:'SYN-1048',age:78,sex:'Female',serviceLine:'Cardiology',primaryDiagnosis:'Acute on chronic heart failure',dischargeTime:'Today, 10:42 AM',dischargeDate:'2026-10-08',lengthOfStay:6,priorAdmissions12m:2,edVisits12m:3,comorbidityCount:5,disposition:'Home health',followUpScheduled:true,riskProbability:.84,riskBand:'High',reviewed:false,noteSummary:'Persistent volume overload improved with IV diuresis. Two admissions for decompensation in the past year; home weight monitoring and cardiology follow-up arranged.'},
  { encounterId:'ENC-48307',patientId:'SYN-2086',age:66,sex:'Male',serviceLine:'Hospital Medicine',primaryDiagnosis:'Community-acquired pneumonia',dischargeTime:'Today, 9:18 AM',dischargeDate:'2026-10-08',lengthOfStay:4,priorAdmissions12m:1,edVisits12m:2,comorbidityCount:3,disposition:'Home',followUpScheduled:false,riskProbability:.72,riskBand:'High',reviewed:false,noteSummary:'Oxygen requirement resolved. New inhaler education completed; primary care follow-up not yet confirmed.'},
  { encounterId:'ENC-48275',patientId:'SYN-1732',age:71,sex:'Female',serviceLine:'Endocrinology',primaryDiagnosis:'Diabetic foot infection',dischargeTime:'Today, 8:56 AM',dischargeDate:'2026-10-08',lengthOfStay:8,priorAdmissions12m:2,edVisits12m:1,comorbidityCount:4,disposition:'Skilled nursing',followUpScheduled:true,riskProbability:.64,riskBand:'Elevated',reviewed:true,noteSummary:'Completed IV antibiotic course after debridement. Wound care plan and skilled nursing placement documented.'},
  { encounterId:'ENC-48193',patientId:'SYN-0864',age:59,sex:'Male',serviceLine:'Pulmonary',primaryDiagnosis:'COPD with acute exacerbation',dischargeTime:'Today, 8:31 AM',dischargeDate:'2026-10-08',lengthOfStay:3,priorAdmissions12m:1,edVisits12m:4,comorbidityCount:2,disposition:'Home health',followUpScheduled:true,riskProbability:.57,riskBand:'Elevated',reviewed:false,noteSummary:'Symptoms improved after bronchodilator therapy and steroid taper. Frequent emergency visits noted.'},
  { encounterId:'ENC-48062',patientId:'SYN-3519',age:82,sex:'Female',serviceLine:'Hospital Medicine',primaryDiagnosis:'Urinary tract infection',dischargeTime:'Today, 7:55 AM',dischargeDate:'2026-10-08',lengthOfStay:5,priorAdmissions12m:0,edVisits12m:1,comorbidityCount:3,disposition:'Home',followUpScheduled:true,riskProbability:.39,riskBand:'Moderate',reviewed:false,noteSummary:'Oral antibiotic transition tolerated. Mobility and medication review completed before discharge.'},
  { encounterId:'ENC-47995',patientId:'SYN-2310',age:48,sex:'Female',serviceLine:'General Surgery',primaryDiagnosis:'Post-operative bowel obstruction',dischargeTime:'Yesterday, 4:22 PM',dischargeDate:'2026-10-07',lengthOfStay:7,priorAdmissions12m:1,edVisits12m:0,comorbidityCount:1,disposition:'Home',followUpScheduled:true,riskProbability:.31,riskBand:'Moderate',reviewed:true,noteSummary:'Tolerating diet with bowel function returned. Surgical clinic follow-up scheduled in 10 days.'},
  { encounterId:'ENC-47941',patientId:'SYN-7291',age:63,sex:'Male',serviceLine:'Orthopedics',primaryDiagnosis:'Total knee arthroplasty',dischargeTime:'Yesterday, 2:05 PM',dischargeDate:'2026-10-07',lengthOfStay:2,priorAdmissions12m:0,edVisits12m:0,comorbidityCount:1,disposition:'Home',followUpScheduled:true,riskProbability:.18,riskBand:'Low',reviewed:false,noteSummary:'Post-operative recovery uncomplicated. Home physical therapy arranged; pain controlled on oral regimen.'},
  { encounterId:'ENC-47888',patientId:'SYN-4407',age:54,sex:'Female',serviceLine:'Neurology',primaryDiagnosis:'Transient ischemic attack',dischargeTime:'Yesterday, 11:46 AM',dischargeDate:'2026-10-07',lengthOfStay:2,priorAdmissions12m:0,edVisits12m:1,comorbidityCount:2,disposition:'Home',followUpScheduled:true,riskProbability:.12,riskBand:'Low',reviewed:true,noteSummary:'No residual symptoms. Secondary prevention plan reviewed and neurology follow-up confirmed.'},
];

export const syntheticHistory: HistoryRecord[] = [
  {historyId:'HIST-1048-A',patientId:'SYN-1048',dischargeDate:'2026-06-21',diagnosis:'Acute decompensated heart failure',readmissionWithin30Days:true,outcomeNote:'Readmitted on day 12'},
  {historyId:'HIST-1048-B',patientId:'SYN-1048',dischargeDate:'2026-02-08',diagnosis:'Volume overload',readmissionWithin30Days:false},
  {historyId:'HIST-2086-A',patientId:'SYN-2086',dischargeDate:'2026-08-13',diagnosis:'Community-acquired pneumonia',readmissionWithin30Days:true,outcomeNote:'Readmitted on day 21'},
  {historyId:'HIST-2086-B',patientId:'SYN-2086',dischargeDate:'2025-05-04',diagnosis:'COPD exacerbation',readmissionWithin30Days:false},
  {historyId:'HIST-1732-A',patientId:'SYN-1732',dischargeDate:'2026-04-18',diagnosis:'Diabetic foot cellulitis',readmissionWithin30Days:true,outcomeNote:'Readmitted on day 9'},
  {historyId:'HIST-1732-B',patientId:'SYN-1732',dischargeDate:'2025-12-22',diagnosis:'Wound infection',readmissionWithin30Days:false},
  {historyId:'HIST-0864-A',patientId:'SYN-0864',dischargeDate:'2026-07-09',diagnosis:'COPD exacerbation',readmissionWithin30Days:true,outcomeNote:'Readmitted on day 16'},
  {historyId:'HIST-0864-B',patientId:'SYN-0864',dischargeDate:'2025-01-26',diagnosis:'Acute bronchitis',readmissionWithin30Days:false},
  {historyId:'HIST-3519-A',patientId:'SYN-3519',dischargeDate:'2025-05-02',diagnosis:'Pyelonephritis',readmissionWithin30Days:false},
  {historyId:'HIST-2310-A',patientId:'SYN-2310',dischargeDate:'2026-03-14',diagnosis:'Small bowel obstruction',readmissionWithin30Days:true,outcomeNote:'Readmitted on day 24'},
  {historyId:'HIST-7291-A',patientId:'SYN-7291',dischargeDate:'2025-05-30',diagnosis:'Knee osteoarthritis',readmissionWithin30Days:false},
  {historyId:'HIST-4407-A',patientId:'SYN-4407',dischargeDate:'2025-07-26',diagnosis:'Transient ischemic attack',readmissionWithin30Days:false},
];

export function getEncounterHistory(patientId:string, saved:Encounter[], currentEncounterId?:string):HistoryRecord[] {
  const code=patientId.trim().toUpperCase();
  if (!code) return [];
  const seeded=syntheticHistory.filter(record=>record.patientId===code).map(record=>({...record,source:'synthetic-history' as const}));
  const savedRecords=saved.filter(item=>item.patientId.toUpperCase()===code&&item.encounterId!==currentEncounterId).map(item=>({
    historyId:item.encounterId,
    patientId:item.patientId,
    dischargeDate:item.dischargeDate??item.dischargeTime,
    diagnosis:item.primaryDiagnosis,
    readmissionWithin30Days:item.readmissionWithin30Days??null,
    outcomeNote:item.readmissionWithin30Days===true?'Readmitted within 30 days':item.readmissionWithin30Days===false?'No 30-day readmission recorded':undefined,
    source:'saved-encounter' as const,
  }));
  return [...savedRecords,...seeded].sort((a,b)=>b.dischargeDate.localeCompare(a.dischargeDate));
}

export function countAdmissionsInPastYear(patientId:string, saved:Encounter[], now=new Date()):number {
  const cutoff=new Date(now);
  cutoff.setFullYear(cutoff.getFullYear()-1);
  return getEncounterHistory(patientId,saved).filter(record=>{
    const date=Date.parse(`${record.dischargeDate}T23:59:59`);
    return Number.isFinite(date)&&date>=cutoff.getTime();
  }).length;
}

export function estimateDemoRisk(inputs:RiskInputs, history:HistoryRecord[]):DemoRiskEstimate {
  let score=.08;
  const factors:{label:string;value:number}[]=[{label:'Baseline demo score',value:.08}];
  const add=(label:string,value:number)=>{if(value>0){score+=value;factors.push({label,value});}};
  if(inputs.age>=75)add('Age 75 or older',.12);else if(inputs.age>=65)add('Age 65–74',.08);
  add(`${inputs.priorAdmissions12m} prior admission${inputs.priorAdmissions12m===1?'':'s'} in 12 months`,Math.min(inputs.priorAdmissions12m*.09,.24));
  add(`${inputs.edVisits12m} emergency visit${inputs.edVisits12m===1?'':'s'} in 12 months`,Math.min(inputs.edVisits12m*.035,.14));
  add(`${inputs.comorbidityCount} comorbidit${inputs.comorbidityCount===1?'y':'ies'}`,Math.min(inputs.comorbidityCount*.025,.15));
  if(inputs.lengthOfStay>=7)add('Length of stay 7 days or longer',.08);else if(inputs.lengthOfStay>=4)add('Length of stay 4–6 days',.04);
  if(!inputs.followUpScheduled)add('No follow-up scheduled',.08);
  const known=history.filter(record=>record.readmissionWithin30Days!==null);
  if(known.length){
    const rate=known.filter(record=>record.readmissionWithin30Days===true).length/known.length;
    if(rate>0)add(`Prior demo history: ${Math.round(rate*100)}% readmitted`,rate*.24);
  }
  const riskProbability=Math.min(.94,Math.max(.04,Number(score.toFixed(2))));
  const riskBand:RiskBand=riskProbability>=.70?'High':riskProbability>=.50?'Elevated':riskProbability>=.30?'Moderate':'Low';
  factors.sort((a,b)=>b.value-a.value);
  return {riskProbability,riskBand,riskFactors:factors.slice(0,4).map(item=>item.label)};
}

export const ragFeature: RagFeature = {
  neighborsRetrieved: 5, historicalReadmissionRate: .60,
  neighborCases: [
    { encounterId:'SYN-H-1924',similarity:.92,diagnosis:'Acute on chronic heart failure',outcome:'readmitted',daysToReadmission:11,summary:'Recurrent fluid overload; home diuretic adjustment documented.' },
    { encounterId:'SYN-H-0381',similarity:.88,diagnosis:'Heart failure with reduced EF',outcome:'readmitted',daysToReadmission:18,summary:'Missed early cardiology review; returned with dyspnea.' },
    { encounterId:'SYN-H-4217',similarity:.84,diagnosis:'Acute on chronic heart failure',outcome:'not readmitted',daysToReadmission:null,summary:'Home nursing completed daily weights and medication reconciliation.' },
    { encounterId:'SYN-H-2406',similarity:.80,diagnosis:'Pulmonary edema',outcome:'readmitted',daysToReadmission:7,summary:'Discharge weight above documented dry weight.' },
    { encounterId:'SYN-H-5170',similarity:.77,diagnosis:'Heart failure exacerbation',outcome:'not readmitted',daysToReadmission:null,summary:'Early outpatient review and caregiver support documented.' },
  ],
};

export const modelMetrics: ModelMetrics[] = [
  {modelName:'Logistic Regression',aucRoc:.704,f1:.382,precision:.411,recall:.357},
  {modelName:'Random Forest',aucRoc:.761,f1:.446,precision:.472,recall:.423},
  {modelName:'Clinical Transformer',aucRoc:.803,f1:.491,precision:.508,recall:.475},
  {modelName:'Clinical Transformer + RAG',aucRoc:.836,f1:.536,precision:.552,recall:.521},
];
