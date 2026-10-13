import { PatientEncounter } from '../types';
const make=(id:string,name:string,age:number,diagnosis:string,ward:'General'|'Semi-Private'|'ICU',riskProbability:number,reviewed=false):PatientEncounter=>({
 encounterId:id,patientId:name,age,gender:'Other',admissionType:'Emergency',ward,serviceLine:diagnosis.includes('Heart')||diagnosis.includes('Myocardial')?'Cardiology':'Internal Medicine',
 primaryDiagnosis:diagnosis,secondaryDiagnoses:[],admissionDate:'2026-10-08',dischargeDate:'2026-10-12',losDays:4,priorAdmissions12m:1,daysSinceLastDischarge:120,
 charlsonIndex:2,comorbidityCount:2,proceduresCount:1,hospitalBeds:240,totalBillInr:54000,outOfPocketInr:12000,insurance:'Private Insurance',bplCard:false,hospitalTier:'tier2',teachingHospital:true,patientState:'Odisha',hospitalState:'Odisha',
 clinicalLabs:{hba1c:7.2,creatinine:1.2,haemoglobin:11.4,systolicBp:132},dischargeDisposition:'Home / Self Care',followUpScheduled:false,riskProbability,riskBand:riskProbability>=.65?'High':riskProbability>=.45?'Elevated':riskProbability>=.25?'Moderate':'Low',reviewed,clinicalNoteSummary:'Initial demo record for dashboard testing.',ragFeature:{neighborsRetrieved:3,historicalReadmissionRate:riskProbability,neighborCases:[]}
});
export const INITIAL_COHORT:PatientEncounter[]=[
 make('ENC-1042','Patient A',72,'Heart Failure (NYHA Class III/IV)','ICU',.78),
 make('ENC-1043','Patient B',64,'COPD Exacerbation with Hypercapnia','General',.58,true),
 make('ENC-1044','Patient C',51,'Community-Acquired Pneumonia (Moderate)','Semi-Private',.31),
 make('ENC-1045','Patient D',80,'Acute Myocardial Infarction (STEMI)','ICU',.86),
 make('ENC-1046','Patient E',43,'Uncontrolled Type 2 Diabetes Mellitus','General',.19,true)
];
