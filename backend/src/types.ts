export type RiskBand = 'High' | 'Elevated' | 'Moderate' | 'Low';
export type EmergencyAcuity = 'Critical' | 'Emergent' | 'Urgent' | 'Non-urgent';
export interface DiseaseProfile { name:string; category:string; baseReadmissionRisk:number; mortalityRate30d:number; acuity:EmergencyAcuity; defaultStayDays:number; typicalCharlson:number; }
export interface RagNeighborCase { encounterId:string; similarity:number; age:number; losDays:number; charlsonIndex:number; primaryDiagnosis:string; outcome:'Readmitted'|'Not Readmitted'; daysToReadmission:number|null; summary:string; }
export interface PatientEncounter {
 encounterId:string; patientId:string; age:number; gender:'M'|'F'|'Other'; admissionType:'Emergency'|'Elective'|'Urgent'|'OPD'; ward:'General'|'Semi-Private'|'ICU';
 serviceLine:'Cardiology'|'Internal Medicine'|'Pulmonology'|'ICU'|'Endocrinology'|'Nephrology'|'Orthopedics';
 primaryDiagnosis:string; secondaryDiagnoses:string[]; admissionDate:string; dischargeDate:string; losDays:number; priorAdmissions12m:number; daysSinceLastDischarge:number|null;
 charlsonIndex:number; comorbidityCount:number; proceduresCount:number; hospitalBeds:number; totalBillInr:number; outOfPocketInr:number;
 insurance:'Ayushman Bharat (PM-JAY)'|'Private Insurance'|'CGHS/ECHS'|'Self-Pay'; bplCard:boolean; hospitalTier:'tier1'|'tier2'|'tier3'; teachingHospital:boolean; patientState:string; hospitalState:string;
 clinicalLabs:{hba1c:number;creatinine:number;haemoglobin:number;systolicBp:number};
 dischargeDisposition:'Recovered'|'Home / Self Care'|'Home Health Agency'|'Transferred'|'LAMA'; followUpScheduled:boolean;
 riskProbability:number; riskBand:RiskBand; reviewed:boolean; clinicalNoteSummary:string; ragFeature:{neighborsRetrieved:number;historicalReadmissionRate:number;neighborCases:RagNeighborCase[]};
}
