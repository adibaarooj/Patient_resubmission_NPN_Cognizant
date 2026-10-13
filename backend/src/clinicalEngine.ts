import { EmergencyAcuity, RiskBand } from './types';
export const DISEASE_TAXONOMY: Record<string,{name:string;category:string;baseReadmissionRisk:number;mortalityRate30d:number;acuity:EmergencyAcuity;defaultStayDays:number;typicalCharlson:number}> = {
 'Acute Myocardial Infarction (STEMI)':{name:'Acute Myocardial Infarction (STEMI)',category:'Cardiovascular',baseReadmissionRisk:.68,mortalityRate30d:.14,acuity:'Critical',defaultStayDays:6,typicalCharlson:4},
 'Septic Shock / Severe Sepsis':{name:'Septic Shock / Severe Sepsis',category:'Infectious',baseReadmissionRisk:.74,mortalityRate30d:.28,acuity:'Critical',defaultStayDays:9,typicalCharlson:5},
 'Heart Failure (NYHA Class III/IV)':{name:'Heart Failure (NYHA Class III/IV)',category:'Cardiovascular',baseReadmissionRisk:.62,mortalityRate30d:.11,acuity:'Emergent',defaultStayDays:5,typicalCharlson:3},
 'End-Stage Renal Disease (ESRD) on Hemodialysis':{name:'End-Stage Renal Disease (ESRD) on Hemodialysis',category:'Renal',baseReadmissionRisk:.58,mortalityRate30d:.12,acuity:'Emergent',defaultStayDays:4,typicalCharlson:4},
 'COPD Exacerbation with Hypercapnia':{name:'COPD Exacerbation with Hypercapnia',category:'Pulmonary',baseReadmissionRisk:.49,mortalityRate30d:.08,acuity:'Emergent',defaultStayDays:5,typicalCharlson:3},
 'Acute Necrotizing Pancreatitis':{name:'Acute Necrotizing Pancreatitis',category:'Gastrointestinal',baseReadmissionRisk:.44,mortalityRate30d:.09,acuity:'Emergent',defaultStayDays:8,typicalCharlson:3},
 'Community-Acquired Pneumonia (Moderate)':{name:'Community-Acquired Pneumonia (Moderate)',category:'Pulmonary',baseReadmissionRisk:.28,mortalityRate30d:.04,acuity:'Urgent',defaultStayDays:4,typicalCharlson:2},
 'Type 1 diabetes mellitus':{name:'Type 1 diabetes mellitus',category:'Endocrine',baseReadmissionRisk:.07,mortalityRate30d:.01,acuity:'Non-urgent',defaultStayDays:5,typicalCharlson:2},
 'Uncontrolled Type 2 Diabetes Mellitus':{name:'Uncontrolled Type 2 Diabetes Mellitus',category:'Endocrine',baseReadmissionRisk:.16,mortalityRate30d:.02,acuity:'Non-urgent',defaultStayDays:3,typicalCharlson:2},
 'Elective Total Knee Arthroplasty':{name:'Elective Total Knee Arthroplasty',category:'Orthopedics',baseReadmissionRisk:.05,mortalityRate30d:.003,acuity:'Non-urgent',defaultStayDays:3,typicalCharlson:1}
};
export function calculateClinicalScore(patient:any) {
 const disease=DISEASE_TAXONOMY[patient.primaryDiagnosis]||{baseReadmissionRisk:.15,mortalityRate30d:.03,acuity:'Urgent' as EmergencyAcuity};
 const base=Math.min(.99,Math.max(.01,disease.baseReadmissionRisk));
 let logit=Math.log(base/(1-base));
 if(patient.age>70)logit+=.35;else if(patient.age>55)logit+=.15;else if(patient.age<35)logit-=.25;
 if(patient.losDays>7)logit+=.32;else if(patient.losDays<=3)logit-=.18;
 logit+=(Number(patient.priorAdmissions12m)||0)*.24;
 if(patient.charlsonIndex>=4)logit+=.45;else if(patient.charlsonIndex<=1)logit-=.2;
 if(patient.ward==='ICU')logit+=.4;
 if(patient.dischargeDisposition==='LAMA')logit+=.65;else if(patient.dischargeDisposition==='Recovered')logit-=.25;
 if(patient.bplCard)logit+=.12;
 if(patient.insurance==='Ayushman Bharat (PM-JAY)')logit+=.05;
 const labs=patient.clinicalLabs||{};
 if(Number(labs.creatinine)>1.8)logit+=.28;
 if(Number(labs.haemoglobin)<10)logit+=.22;
 if(Number(labs.hba1c)>9)logit+=.18;
 const probability=Math.min(.96,Math.max(.04,Number((1/(1+Math.exp(-logit))).toFixed(3))));
 const riskBand:RiskBand=probability>=.65?'High':probability>=.45?'Elevated':probability>=.25?'Moderate':'Low';
 return {probability,riskBand,mortalityRate:disease.mortalityRate30d,acuity:disease.acuity, rationale:[
 ...(patient.age>70?['Age over 70']:[]),...(patient.losDays>7?['Length of stay over 7 days']:[]),
 ...((Number(patient.priorAdmissions12m)||0)>0?['Prior admissions in the last 12 months']:[]),
 ...(patient.ward==='ICU'?['ICU admission']:[]),...(patient.dischargeDisposition==='LAMA'?['Discharged against medical advice (LAMA)']:[]),
 ...(Number(labs.creatinine)>1.8?['Creatinine above 1.8']:[]),...(Number(labs.haemoglobin)<10?['Haemoglobin below 10']:[]),...(Number(labs.hba1c)>9?['HbA1c above 9']:[])
 ]};
}
