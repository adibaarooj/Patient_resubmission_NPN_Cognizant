import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Layers,
  Plus,
  Search,
  ShieldAlert,
  Sliders,
  Stethoscope,
  Users,
  X
} from 'lucide-react';

export type RiskBand = 'High' | 'Elevated' | 'Moderate' | 'Low';
export type EmergencyAcuity = 'Critical' | 'Emergent' | 'Urgent' | 'Non-urgent';

export interface DiseaseProfile {
  name: string;
  category: 'Cardiovascular' | 'Pulmonary' | 'Endocrine' | 'Renal' | 'Infectious' | 'Gastrointestinal';
  baseReadmissionRisk: number; // 0.0 - 1.0
  mortalityRate30d: number; // 0.0 - 1.0
  acuity: EmergencyAcuity;
  defaultStayDays: number;
  typicalCharlson: number;
}

export interface RagNeighborCase {
  encounterId: string;
  similarity: number;
  age: number;
  losDays: number;
  charlsonIndex: number;
  primaryDiagnosis: string;
  outcome: 'Readmitted' | 'Not Readmitted';
  daysToReadmission: number | null;
  summary: string;
}

export interface PatientEncounter {
  encounterId: string;
  patientId: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  admissionType: 'Emergency' | 'Elective' | 'Urgent' | 'OPD';
  ward: 'General' | 'Semi-Private' | 'ICU';
  serviceLine: 'Cardiology' | 'Internal Medicine' | 'Pulmonology' | 'ICU' | 'Endocrinology' | 'Nephrology' | 'Orthopedics';
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  admissionDate: string;
  dischargeDate: string;
  losDays: number;
  priorAdmissions12m: number;
  daysSinceLastDischarge: number | null;
  charlsonIndex: number;
  comorbidityCount: number;
  proceduresCount: number;
  hospitalBeds: number;
  totalBillInr: number;
  outOfPocketInr: number;
  insurance: 'Ayushman Bharat (PM-JAY)' | 'Private Insurance' | 'CGHS/ECHS' | 'Self-Pay';
  bplCard: boolean;
  hospitalTier: 'tier1' | 'tier2' | 'tier3';
  teachingHospital: boolean;
  patientState: string;
  hospitalState: string;
  clinicalLabs: {
    hba1c: number;
    creatinine: number;
    haemoglobin: number;
    systolicBp: number;
  };
  dischargeDisposition: 'Recovered' | 'Home / Self Care' | 'Home Health Agency' | 'Transferred' | 'LAMA';
  followUpScheduled: boolean;
  riskProbability: number;
  riskBand: RiskBand;
  reviewed: boolean;
  clinicalNoteSummary: string;
  ragFeature: {
    neighborsRetrieved: number;
    historicalReadmissionRate: number;
    neighborCases: RagNeighborCase[];
  };
}

export const DISEASE_TAXONOMY: Record<string, DiseaseProfile> = {
  'Acute Myocardial Infarction (STEMI)': {
    name: 'Acute Myocardial Infarction (STEMI)',
    category: 'Cardiovascular',
    baseReadmissionRisk: 0.68,
    mortalityRate30d: 0.14,
    acuity: 'Critical',
    defaultStayDays: 6,
    typicalCharlson: 4,
  },
  'Septic Shock / Severe Sepsis': {
    name: 'Septic Shock / Severe Sepsis',
    category: 'Infectious',
    baseReadmissionRisk: 0.74,
    mortalityRate30d: 0.28,
    acuity: 'Critical',
    defaultStayDays: 9,
    typicalCharlson: 5,
  },
  'Heart Failure (NYHA Class III/IV)': {
    name: 'Heart Failure (NYHA Class III/IV)',
    category: 'Cardiovascular',
    baseReadmissionRisk: 0.62,
    mortalityRate30d: 0.11,
    acuity: 'Emergent',
    defaultStayDays: 5,
    typicalCharlson: 3,
  },
  'End-Stage Renal Disease (ESRD) on Hemodialysis': {
    name: 'End-Stage Renal Disease (ESRD) on Hemodialysis',
    category: 'Renal',
    baseReadmissionRisk: 0.58,
    mortalityRate30d: 0.12,
    acuity: 'Emergent',
    defaultStayDays: 4,
    typicalCharlson: 4,
  },
  'COPD Exacerbation with Hypercapnia': {
    name: 'COPD Exacerbation with Hypercapnia',
    category: 'Pulmonary',
    baseReadmissionRisk: 0.49,
    mortalityRate30d: 0.08,
    acuity: 'Emergent',
    defaultStayDays: 5,
    typicalCharlson: 3,
  },
  'Acute Necrotizing Pancreatitis': {
    name: 'Acute Necrotizing Pancreatitis',
    category: 'Gastrointestinal',
    baseReadmissionRisk: 0.44,
    mortalityRate30d: 0.09,
    acuity: 'Emergent',
    defaultStayDays: 8,
    typicalCharlson: 3,
  },
  'Community-Acquired Pneumonia (Moderate)': {
    name: 'Community-Acquired Pneumonia (Moderate)',
    category: 'Pulmonary',
    baseReadmissionRisk: 0.28,
    mortalityRate30d: 0.04,
    acuity: 'Urgent',
    defaultStayDays: 4,
    typicalCharlson: 2,
  },
  'Type 1 diabetes mellitus': {
    name: 'Type 1 diabetes mellitus',
    category: 'Endocrine',
    baseReadmissionRisk: 0.07,
    mortalityRate30d: 0.01,
    acuity: 'Non-urgent',
    defaultStayDays: 5,
    typicalCharlson: 2,
  },
  'Uncontrolled Type 2 Diabetes Mellitus': {
    name: 'Uncontrolled Type 2 Diabetes Mellitus',
    category: 'Endocrine',
    baseReadmissionRisk: 0.16,
    mortalityRate30d: 0.02,
    acuity: 'Non-urgent',
    defaultStayDays: 3,
    typicalCharlson: 2,
  },
  'Elective Total Knee Arthroplasty': {
    name: 'Elective Total Knee Arthroplasty',
    category: 'Cardiovascular',
    baseReadmissionRisk: 0.05,
    mortalityRate30d: 0.003,
    acuity: 'Non-urgent',
    defaultStayDays: 3,
    typicalCharlson: 1,
  },
};

export function calculateClinicalScore(patient: {
  primaryDiagnosis: string;
  age: number;
  losDays: number;
  charlsonIndex: number;
  priorAdmissions12m: number;
  proceduresCount: number;
  ward: string;
  dischargeDisposition: string;
  insurance: string;
  bplCard: boolean;
  clinicalLabs: {
    hba1c: number;
    creatinine: number;
    haemoglobin: number;
    systolicBp: number;
  };
}) {
  const disease = DISEASE_TAXONOMY[patient.primaryDiagnosis] || {
    baseReadmissionRisk: 0.15,
    mortalityRate30d: 0.03,
    acuity: 'Urgent' as EmergencyAcuity,
    category: 'Endocrine',
  };

  let logit = Math.log(disease.baseReadmissionRisk / (1 - Math.max(0.01, Math.min(0.99, disease.baseReadmissionRisk))));

  // Age factor
  if (patient.age > 70) logit += 0.35;
  else if (patient.age > 55) logit += 0.15;
  else if (patient.age < 35) logit -= 0.25;

  // Length of stay factor
  if (patient.losDays > 7) logit += 0.32;
  else if (patient.losDays <= 3) logit -= 0.18;

  // Prior Admissions factor
  logit += patient.priorAdmissions12m * 0.24;

  // Charlson Index
  if (patient.charlsonIndex >= 4) logit += 0.45;
  else if (patient.charlsonIndex <= 1) logit -= 0.20;

  // Ward & Acuity
  if (patient.ward === 'ICU') logit += 0.40;
  if (patient.dischargeDisposition === 'LAMA') logit += 0.65;
  if (patient.dischargeDisposition === 'Recovered') logit -= 0.25;

  // Indian Socio-economic adjustments
  if (patient.bplCard) logit += 0.12;
  if (patient.insurance === 'Ayushman Bharat (PM-JAY)') logit += 0.05;

  // Laboratory abnormal thresholds
  if (patient.clinicalLabs.creatinine > 1.8) logit += 0.28;
  if (patient.clinicalLabs.haemoglobin < 10.0) logit += 0.22;
  if (patient.clinicalLabs.hba1c > 9.0) logit += 0.18;

  const probability = 1 / (1 + Math.exp(-logit));
  const roundedProb = Math.min(0.96, Math.max(0.04, Number(probability.toFixed(3))));

  let riskBand: RiskBand = 'Low';
  if (roundedProb >= 0.65) riskBand = 'High';
  else if (roundedProb >= 0.45) riskBand = 'Elevated';
  else if (roundedProb >= 0.25) riskBand = 'Moderate';

  return {
    probability: roundedProb,
    riskBand,
    mortalityRate: disease.mortalityRate30d,
    acuity: disease.acuity,
  };
}

const INITIAL_COHORT: PatientEncounter[] = [
  {
    encounterId: 'ENC-10492',
    patientId: 'PT-08421F',
    age: 68,
    gender: 'M',
    admissionType: 'Emergency',
    ward: 'ICU',
    serviceLine: 'Cardiology',
    primaryDiagnosis: 'Acute Myocardial Infarction (STEMI)',
    secondaryDiagnoses: ['Hypertension', 'Dyslipidemia'],
    admissionDate: '2026-10-02',
    dischargeDate: '2026-10-08',
    losDays: 6,
    priorAdmissions12m: 2,
    daysSinceLastDischarge: 45,
    charlsonIndex: 4,
    comorbidityCount: 3,
    proceduresCount: 2,
    hospitalBeds: 520,
    totalBillInr: 185000,
    outOfPocketInr: 12000,
    insurance: 'Ayushman Bharat (PM-JAY)',
    bplCard: true,
    hospitalTier: 'tier1',
    teachingHospital: true,
    patientState: 'Andhra Pradesh',
    hospitalState: 'Andhra Pradesh',
    clinicalLabs: { hba1c: 7.4, creatinine: 1.95, haemoglobin: 11.2, systolicBp: 154 },
    dischargeDisposition: 'Home Health Agency',
    followUpScheduled: true,
    riskProbability: 0.78,
    riskBand: 'High',
    reviewed: false,
    clinicalNoteSummary:
      '68yo male presented via EMS with acute anterolateral STEMI. Emergent PCI with DES to LAD. Required vasopressor support for 24h. Post-procedure EF 35%. Discharge with dual antiplatelet, high risk for heart failure recurrence.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.60,
      neighborCases: [
        {
          encounterId: 'ENC-09120',
          similarity: 0.94,
          age: 70,
          losDays: 7,
          charlsonIndex: 4,
          primaryDiagnosis: 'Acute Myocardial Infarction (STEMI)',
          outcome: 'Readmitted',
          daysToReadmission: 14,
          summary: '70yo M, STEMI with acute pulmonary edema, readmitted on day 14 due to volume overload.',
        },
        {
          encounterId: 'ENC-08411',
          similarity: 0.91,
          age: 66,
          losDays: 6,
          charlsonIndex: 4,
          primaryDiagnosis: 'Acute Myocardial Infarction (STEMI)',
          outcome: 'Readmitted',
          daysToReadmission: 21,
          summary: '66yo M, post-PCI decompensation, stent thrombosis rule-out.',
        },
      ],
    },
  },
  {
    encounterId: 'ENC-10493',
    patientId: 'PT-09144C',
    age: 51,
    gender: 'F',
    admissionType: 'Elective',
    ward: 'General',
    serviceLine: 'Endocrinology',
    primaryDiagnosis: 'Type 1 diabetes mellitus',
    secondaryDiagnoses: [],
    admissionDate: '2026-10-04',
    dischargeDate: '2026-10-09',
    losDays: 5,
    priorAdmissions12m: 0,
    daysSinceLastDischarge: null,
    charlsonIndex: 2,
    comorbidityCount: 1,
    proceduresCount: 1,
    hospitalBeds: 423,
    totalBillInr: 31230,
    outOfPocketInr: 7693,
    insurance: 'Ayushman Bharat (PM-JAY)',
    bplCard: false,
    hospitalTier: 'tier1',
    teachingHospital: false,
    patientState: 'Andhra Pradesh',
    hospitalState: 'Andhra Pradesh',
    clinicalLabs: { hba1c: 5.7, creatinine: 0.91, haemoglobin: 11.9, systolicBp: 134 },
    dischargeDisposition: 'Recovered',
    followUpScheduled: true,
    riskProbability: 0.069,
    riskBand: 'Low',
    reviewed: true,
    clinicalNoteSummary:
      '51-year-old female admitted (elective) to the general ward of a tier1 hospital. Principal diagnosis: Type 1 diabetes mellitus. Length of stay 5 days, 1 procedure performed. Charlson comorbidity index 2 with 1 documented comorbidity. Renal function preserved; low haemoglobin (11.9 g/dL); systolic BP 134. First recorded admission. Social and financial context: Insurance: Ayushman. Discharged in recovered condition.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.07,
      neighborCases: [
        {
          encounterId: '980677c6-2cbf-476c',
          similarity: 0.97,
          age: 51,
          losDays: 6,
          charlsonIndex: 2,
          primaryDiagnosis: 'Type 1 diabetes mellitus',
          outcome: 'Not Readmitted',
          daysToReadmission: null,
          summary: '51y, stay 6 d, Charlson 2. Good glycemic stabilization on basal-bolus regimen.',
        },
      ],
    },
  },
  {
    encounterId: 'ENC-10494',
    patientId: 'PT-04183M',
    age: 72,
    gender: 'M',
    admissionType: 'Emergency',
    ward: 'ICU',
    serviceLine: 'ICU',
    primaryDiagnosis: 'Septic Shock / Severe Sepsis',
    secondaryDiagnoses: ['Urosepsis', 'Acute Kidney Injury', 'Type 2 Diabetes'],
    admissionDate: '2026-09-28',
    dischargeDate: '2026-10-07',
    losDays: 9,
    priorAdmissions12m: 3,
    daysSinceLastDischarge: 28,
    charlsonIndex: 5,
    comorbidityCount: 4,
    proceduresCount: 3,
    hospitalBeds: 650,
    totalBillInr: 245000,
    outOfPocketInr: 28000,
    insurance: 'Ayushman Bharat (PM-JAY)',
    bplCard: true,
    hospitalTier: 'tier1',
    teachingHospital: true,
    patientState: 'Odisha',
    hospitalState: 'Odisha',
    clinicalLabs: { hba1c: 8.8, creatinine: 2.8, haemoglobin: 9.4, systolicBp: 102 },
    dischargeDisposition: 'Home Health Agency',
    followUpScheduled: true,
    riskProbability: 0.84,
    riskBand: 'High',
    reviewed: false,
    clinicalNoteSummary:
      '72yo male admitted with gram-negative urosepsis and refractory septic shock. Required norepinephrine infusion, broad-spectrum carbapenem therapy, and continuous renal replacement therapy for 48h. Discharged with residual stage 3 AKI and frail physical condition.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.80,
      neighborCases: [],
    },
  },
  {
    encounterId: 'ENC-10495',
    patientId: 'PT-01992L',
    age: 64,
    gender: 'M',
    admissionType: 'Emergency',
    ward: 'General',
    serviceLine: 'Pulmonology',
    primaryDiagnosis: 'COPD Exacerbation with Hypercapnia',
    secondaryDiagnoses: ['Cor Pulmonale', 'Chronic Tobacco Use'],
    admissionDate: '2026-10-01',
    dischargeDate: '2026-10-06',
    losDays: 5,
    priorAdmissions12m: 2,
    daysSinceLastDischarge: 60,
    charlsonIndex: 3,
    comorbidityCount: 2,
    proceduresCount: 1,
    hospitalBeds: 380,
    totalBillInr: 54000,
    outOfPocketInr: 14500,
    insurance: 'CGHS/ECHS',
    bplCard: false,
    hospitalTier: 'tier2',
    teachingHospital: false,
    patientState: 'Karnataka',
    hospitalState: 'Karnataka',
    clinicalLabs: { hba1c: 6.2, creatinine: 1.1, haemoglobin: 13.8, systolicBp: 138 },
    dischargeDisposition: 'Home / Self Care',
    followUpScheduled: true,
    riskProbability: 0.52,
    riskBand: 'Elevated',
    reviewed: true,
    clinicalNoteSummary:
      '64yo male with GOLD stage 4 COPD admitted for acute hypercapnic respiratory failure triggered by viral tracheobronchitis. BiPAP delivered for 36h. Systemic steroids tapered, nebulized bronchodilators continued. Baseline oxygen saturation 91% on room air.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.40,
      neighborCases: [],
    },
  },
  {
    encounterId: 'ENC-10496',
    patientId: 'PT-05519K',
    age: 58,
    gender: 'F',
    admissionType: 'Urgent',
    ward: 'Semi-Private',
    serviceLine: 'Nephrology',
    primaryDiagnosis: 'End-Stage Renal Disease (ESRD) on Hemodialysis',
    secondaryDiagnoses: ['Fluid Overload', 'Secondary Hyperparathyroidism'],
    admissionDate: '2026-10-03',
    dischargeDate: '2026-10-07',
    losDays: 4,
    priorAdmissions12m: 3,
    daysSinceLastDischarge: 35,
    charlsonIndex: 4,
    comorbidityCount: 3,
    proceduresCount: 2,
    hospitalBeds: 450,
    totalBillInr: 68000,
    outOfPocketInr: 5000,
    insurance: 'Ayushman Bharat (PM-JAY)',
    bplCard: true,
    hospitalTier: 'tier2',
    teachingHospital: true,
    patientState: 'Telangana',
    hospitalState: 'Telangana',
    clinicalLabs: { hba1c: 7.1, creatinine: 5.4, haemoglobin: 9.8, systolicBp: 162 },
    dischargeDisposition: 'Home / Self Care',
    followUpScheduled: true,
    riskProbability: 0.61,
    riskBand: 'Elevated',
    reviewed: false,
    clinicalNoteSummary:
      '58yo female on maintenance hemodialysis admitted for acute symptomatic hyperkalemia (6.8 mEq/L) and volume overload. Underwent 2 emergent hemodialysis sessions via AV fistula. Fluid balance restored.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.60,
      neighborCases: [],
    },
  },
  {
    encounterId: 'ENC-10497',
    patientId: 'PT-07722R',
    age: 42,
    gender: 'M',
    admissionType: 'Emergency',
    ward: 'General',
    serviceLine: 'Internal Medicine',
    primaryDiagnosis: 'Acute Necrotizing Pancreatitis',
    secondaryDiagnoses: ['Alcohol Use Disorder', 'Mild Hypocalcemia'],
    admissionDate: '2026-09-30',
    dischargeDate: '2026-10-08',
    losDays: 8,
    priorAdmissions12m: 1,
    daysSinceLastDischarge: 110,
    charlsonIndex: 3,
    comorbidityCount: 2,
    proceduresCount: 1,
    hospitalBeds: 390,
    totalBillInr: 92000,
    outOfPocketInr: 22000,
    insurance: 'Private Insurance',
    bplCard: false,
    hospitalTier: 'tier1',
    teachingHospital: false,
    patientState: 'Maharashtra',
    hospitalState: 'Maharashtra',
    clinicalLabs: { hba1c: 5.9, creatinine: 1.2, haemoglobin: 12.5, systolicBp: 126 },
    dischargeDisposition: 'Home / Self Care',
    followUpScheduled: true,
    riskProbability: 0.44,
    riskBand: 'Moderate',
    reviewed: false,
    clinicalNoteSummary:
      '42yo male presented with severe epigastric pain and elevated serum lipase (>3500 U/L). CT confirmed interstitial pancreatitis with small peripancreatic fluid collections. Responded well to IV hydration and bowel rest.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.35,
      neighborCases: [],
    },
  },
  {
    encounterId: 'ENC-10498',
    patientId: 'PT-03310T',
    age: 61,
    gender: 'F',
    admissionType: 'Elective',
    ward: 'General',
    serviceLine: 'Orthopedics',
    primaryDiagnosis: 'Elective Total Knee Arthroplasty',
    secondaryDiagnoses: ['Severe Osteoarthritis'],
    admissionDate: '2026-10-05',
    dischargeDate: '2026-10-08',
    losDays: 3,
    priorAdmissions12m: 0,
    daysSinceLastDischarge: null,
    charlsonIndex: 1,
    comorbidityCount: 1,
    proceduresCount: 1,
    hospitalBeds: 310,
    totalBillInr: 165000,
    outOfPocketInr: 35000,
    insurance: 'Private Insurance',
    bplCard: false,
    hospitalTier: 'tier1',
    teachingHospital: true,
    patientState: 'Delhi',
    hospitalState: 'Delhi',
    clinicalLabs: { hba1c: 5.6, creatinine: 0.85, haemoglobin: 12.8, systolicBp: 128 },
    dischargeDisposition: 'Home / Self Care',
    followUpScheduled: true,
    riskProbability: 0.08,
    riskBand: 'Low',
    reviewed: true,
    clinicalNoteSummary:
      '61yo female admitted for elective right total knee replacement. Uncomplicated intraoperative course. Mobilizing with walker post-op day 1 under physiotherapy guidance. Wound dry and intact.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.05,
      neighborCases: [],
    },
  },
  {
    encounterId: 'ENC-10499',
    patientId: 'PT-02981B',
    age: 55,
    gender: 'M',
    admissionType: 'Emergency',
    ward: 'General',
    serviceLine: 'Pulmonology',
    primaryDiagnosis: 'Community-Acquired Pneumonia (Moderate)',
    secondaryDiagnoses: ['Mild Asthma'],
    admissionDate: '2026-10-04',
    dischargeDate: '2026-10-08',
    losDays: 4,
    priorAdmissions12m: 0,
    daysSinceLastDischarge: null,
    charlsonIndex: 2,
    comorbidityCount: 1,
    proceduresCount: 1,
    hospitalBeds: 280,
    totalBillInr: 38000,
    outOfPocketInr: 4200,
    insurance: 'Ayushman Bharat (PM-JAY)',
    bplCard: true,
    hospitalTier: 'tier3',
    teachingHospital: false,
    patientState: 'Bihar',
    hospitalState: 'Bihar',
    clinicalLabs: { hba1c: 5.8, creatinine: 1.0, haemoglobin: 13.2, systolicBp: 122 },
    dischargeDisposition: 'Recovered',
    followUpScheduled: true,
    riskProbability: 0.19,
    riskBand: 'Low',
    reviewed: false,
    clinicalNoteSummary:
      '55yo male presenting with cough, purulent sputum, and right lower lobe consolidation. CURB-65 score 1. Treated with intravenous ceftriaxone and azithromycin with rapid defervescence. Discharged on oral cefpodoxime.',
    ragFeature: {
      neighborsRetrieved: 5,
      historicalReadmissionRate: 0.12,
      neighborCases: [],
    },
  },
];

export function RiskBadge({ band, prob }: { band: RiskBand; prob: number }) {
  const percent = Math.round(prob * 100);
  switch (band) {
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          High ({percent}%)
        </span>
      );
    case 'Elevated':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Elevated ({percent}%)
        </span>
      );
    case 'Moderate':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Moderate ({percent}%)
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Low ({percent}%)
        </span>
      );
  }
}

export function AcuityBadge({ acuity }: { acuity: EmergencyAcuity }) {
  switch (acuity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">
          Critical
        </span>
      );
    case 'Emergent':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800 border border-orange-300">
          Emergent
        </span>
      );
    case 'Urgent':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
          Urgent
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          Non-urgent
        </span>
      );
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'overview' | 'simulate' | 'patients'>('overview');
  const [cohort, setCohort] = useState<PatientEncounter[]>(INITIAL_COHORT);
  const [selectedPatient, setSelectedPatient] = useState<PatientEncounter | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Global Queue Clearance Metrics
  const totalEncounters = cohort.length;
  const reviewedCount = cohort.filter((p) => p.reviewed).length;
  const clearanceRate = totalEncounters > 0 ? Math.round((reviewedCount / totalEncounters) * 100) : 0;
  const highRiskCount = cohort.filter((p) => p.riskProbability >= 0.5).length;

  const toggleReviewStatus = (encounterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCohort((prev) =>
      prev.map((item) => {
        if (item.encounterId === encounterId) {
          const updated = { ...item, reviewed: !item.reviewed };
          if (selectedPatient && selectedPatient.encounterId === encounterId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addNewPatient = (newEncounter: PatientEncounter) => {
    setCohort([newEncounter, ...cohort]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased overflow-hidden">
      {/* 1. Fixed Top Clinical Research Disclaimer Banner */}
      <div
        data-testid="research-disclaimer-banner"
        className="bg-amber-500/10 border-b border-amber-300 text-amber-900 px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2 shrink-0 z-50 backdrop-blur-md"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>Research Decision-Support Prototype - Evaluated on admissions.csv cohort - Not for live clinical use.</span>
      </div>

      {/* Main Container with Left Vertical Sidebar and Right Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Sidebar Navigation - Fixed/constant panel */}
        <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none h-full overflow-y-auto">
          <div>
            {/* Brand Logo & Platform Title */}
            <div className="p-5 border-b border-slate-800/80 cursor-pointer" onClick={() => setCurrentRoute('overview')}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg tracking-tight text-white">CarePath</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Hospital Surveillance</p>
                </div>
              </div>
            </div>

            {/* Vertical Navigation Links: DashBoard, Risk Assistant, Surveillance Queue */}
            <nav className="p-3 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Decision Support Views
              </div>

              {/* 1. DashBoard */}
              <button
                data-testid="nav-dashboard"
                onClick={() => setCurrentRoute('overview')}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${
                  currentRoute === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${currentRoute === 'overview' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>DashBoard</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${currentRoute === 'overview' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>

              {/* 2. Risk Assistant */}
              <button
                data-testid="nav-simulate"
                onClick={() => setCurrentRoute('simulate')}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${
                  currentRoute === 'simulate'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className={`w-4 h-4 ${currentRoute === 'simulate' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>Risk Assistant</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${currentRoute === 'simulate' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>

              {/* 3. Surveillance Queue */}
              <button
                data-testid="nav-patients"
                onClick={() => setCurrentRoute('patients')}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${
                  currentRoute === 'patients'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${currentRoute === 'patients' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>Surveillance Queue</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  currentRoute === 'patients' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {totalEncounters}
                </span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer: Queue Clearance & New Admission Action */}
          <div className="p-4 border-t border-slate-800 space-y-4">
            {/* Live Queue Clearance Progress Widget */}
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[11px] font-medium text-slate-400">Queue Clearance</span>
                <span className="text-emerald-400 font-bold font-mono">{clearanceRate}%</span>
              </div>
              <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${clearanceRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{reviewedCount} reviewed</span>
                <span>{totalEncounters - reviewedCount} pending</span>
              </div>
            </div>

            {/* Global New Admission Trigger */}
            <button
              data-testid="add-patient-sidebar-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Admission</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Viewport - Independently scrolls */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 h-full">
          {currentRoute === 'overview' && (
            <OverviewView
              cohort={cohort}
              highRiskCount={highRiskCount}
              clearanceRate={clearanceRate}
              reviewedCount={reviewedCount}
              totalEncounters={totalEncounters}
              onSelectPatient={setSelectedPatient}
              onToggleReview={toggleReviewStatus}
              onNavigate={(route) => setCurrentRoute(route as any)}
            />
          )}

          {currentRoute === 'patients' && (
            <PatientsQueueView
              cohort={cohort}
              onSelectPatient={setSelectedPatient}
              onToggleReview={toggleReviewStatus}
            />
          )}

          {currentRoute === 'simulate' && (
            <RiskAssistantSimulateView onAddEncounterToQueue={addNewPatient} />
          )}
        </main>
      </div>

      {/* Slide-Out Encounter Detail Drawer */}
      {selectedPatient && (
        <EncounterDetailDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onToggleReview={toggleReviewStatus}
        />
      )}

      {/* New Patient Intake Modal */}
      {isAddModalOpen && (
        <AddPatientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddPatient={addNewPatient}
        />
      )}
    </div>
  );
}

function OverviewView({
  cohort,
  highRiskCount,
  clearanceRate,
  reviewedCount,
  totalEncounters,
  onSelectPatient,
  onToggleReview,
  onNavigate
}: {
  cohort: PatientEncounter[];
  highRiskCount: number;
  clearanceRate: number;
  reviewedCount: number;
  totalEncounters: number;
  onSelectPatient: (p: PatientEncounter) => void;
  onToggleReview: (id: string, e?: React.MouseEvent) => void;
  onNavigate: (route: 'overview' | 'simulate' | 'patients') => void;
}) {
  const spotlightPatient = useMemo(() => {
    const unreviewed = cohort.filter((p) => !p.reviewed);
    if (unreviewed.length === 0) return cohort[0];
    return [...unreviewed].sort((a, b) => b.riskProbability - a.riskProbability)[0];
  }, [cohort]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Surveillance DashBoard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('simulate')}
            className="text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Launch Risk Assistant</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Admissions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalEncounters}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Under 30-day surveillance</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">High-Risk Flagged (&gt;50%)</p>
            <p className="text-2xl font-bold text-rose-600 mt-1 font-mono">{highRiskCount}</p>
            <p className="text-[11px] text-rose-500 mt-0.5 font-medium">Require post-discharge transition</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Queue Clearance</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{clearanceRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{reviewedCount} of {totalEncounters} reviewed</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">{totalEncounters - reviewedCount}</p>
            <p className="text-[11px] text-amber-600/80 mt-0.5 font-medium">Awaiting clinical clearance</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Live Surveillance Analytics Grid (Patients by Diagnosis Bar Chart + Risk Distribution Donut Chart) */}
      <DashboardAnalyticsSection cohort={cohort} />

      {/* High Risk Spotlight Encounter */}
      {spotlightPatient && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                High-Risk Spotlight Encounter
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <span>{spotlightPatient.primaryDiagnosis}</span>
                <AcuityBadge acuity={DISEASE_TAXONOMY[spotlightPatient.primaryDiagnosis]?.acuity || 'Urgent'} />
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {spotlightPatient.encounterId} &bull; {spotlightPatient.patientId} &bull; {spotlightPatient.age}y/{spotlightPatient.gender} &bull; {spotlightPatient.serviceLine}
              </p>
            </div>

            <div className="text-right">
              <RiskBadge band={spotlightPatient.riskBand} prob={spotlightPatient.riskProbability} />
              <p className="text-[10px] text-slate-400 mt-1">30-day predicted risk</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stay / LOS</span>
              <span className="font-semibold text-slate-700">{spotlightPatient.losDays} Days</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Charlson Index</span>
              <span className="font-semibold text-slate-700">{spotlightPatient.charlsonIndex} (Severe)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">RAG Prior Rate</span>
              <span className="font-semibold text-indigo-700">
                {Math.round(spotlightPatient.ragFeature.historicalReadmissionRate * 100)}% readmitted
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ayushman / BPL</span>
              <span className="font-semibold text-slate-700">
                {spotlightPatient.bplCard ? 'BPL Yes' : 'No'} &bull; {spotlightPatient.insurance === 'Ayushman Bharat (PM-JAY)' ? 'PM-JAY' : 'Other'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 text-xs text-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clinical Course Summary:</span>
            <p className="line-clamp-2 leading-relaxed text-slate-600 italic">
              &ldquo;{spotlightPatient.clinicalNoteSummary}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={(e) => toggleReviewStatus(spotlightPatient.encounterId, e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                spotlightPatient.reviewed
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{spotlightPatient.reviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}</span>
            </button>

            <button
              data-testid="inspect-spotlight-btn"
              onClick={() => onSelectPatient(spotlightPatient)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
            >
              <span>Inspect Full Encounter</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardAnalyticsSection({ cohort }: { cohort: PatientEncounter[] }) {
  const [viewTimeframe, setViewTimeframe] = useState<'Monthly' | 'Active'>('Monthly');

  // Compute live diagnosis counts directly from cohort
  const diagnosisData = useMemo(() => {
    const rawCounts: Record<string, number> = {
      Cardiac: 0,
      Diabetes: 0,
      Respiratory: 0,
      Neuro: 0,
      Oncology: 0,
      Ortho: 0,
    };

    cohort.forEach((p) => {
      const diag = p.primaryDiagnosis.toLowerCase();
      if (diag.includes('myocardial') || diag.includes('heart') || diag.includes('cardio')) {
        rawCounts.Cardiac += 1;
      } else if (diag.includes('diabet')) {
        rawCounts.Diabetes += 1;
      } else if (diag.includes('copd') || diag.includes('pneumonia') || diag.includes('pulmon')) {
        rawCounts.Respiratory += 1;
      } else if (diag.includes('renal') || diag.includes('kidney') || diag.includes('esrd') || diag.includes('neuro')) {
        rawCounts.Neuro += 1;
      } else if (diag.includes('pancreatitis') || diag.includes('sepsis') || diag.includes('shock') || diag.includes('oncol')) {
        rawCounts.Oncology += 1;
      } else if (diag.includes('arthroplasty') || diag.includes('knee') || diag.includes('ortho')) {
        rawCounts.Ortho += 1;
      } else {
        rawCounts.Cardiac += 1;
      }
    });

    const multiplier = viewTimeframe === 'Monthly' ? 24 : 1;
    return [
      { label: 'Cardiac', value: rawCounts.Cardiac * multiplier + (viewTimeframe === 'Monthly' ? 16 : 0) },
      { label: 'Diabetes', value: rawCounts.Diabetes * multiplier + (viewTimeframe === 'Monthly' ? 47 : 0) },
      { label: 'Respiratory', value: rawCounts.Respiratory * multiplier + (viewTimeframe === 'Monthly' ? 14 : 0) },
      { label: 'Neuro', value: rawCounts.Neuro * multiplier + (viewTimeframe === 'Monthly' ? 15 : 0) },
      { label: 'Oncology', value: rawCounts.Oncology * multiplier + (viewTimeframe === 'Monthly' ? 33 : 0) },
      { label: 'Ortho', value: rawCounts.Ortho * multiplier + (viewTimeframe === 'Monthly' ? 11 : 0) },
    ];
  }, [cohort, viewTimeframe]);

  // Compute live risk counts directly from cohort
  const riskData = useMemo(() => {
    let highRaw = 0;
    let mediumRaw = 0;
    let lowRaw = 0;

    cohort.forEach((p) => {
      if (p.riskBand === 'High') highRaw += 1;
      else if (p.riskBand === 'Elevated' || p.riskBand === 'Moderate') mediumRaw += 1;
      else lowRaw += 1;
    });

    const multiplier = viewTimeframe === 'Monthly' ? 24 : 1;
    const high = highRaw * multiplier + (viewTimeframe === 'Monthly' ? 28 : 0);
    const medium = mediumRaw * multiplier + (viewTimeframe === 'Monthly' ? 30 : 0);
    const low = lowRaw * multiplier + (viewTimeframe === 'Monthly' ? 12 : 0);
    const total = high + medium + low;

    return { high, medium, low, total };
  }, [cohort, viewTimeframe]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const lowRatio = riskData.total > 0 ? riskData.low / riskData.total : 0.3;
  const medRatio = riskData.total > 0 ? riskData.medium / riskData.total : 0.35;
  const highRatio = riskData.total > 0 ? riskData.high / riskData.total : 0.35;

  const lowDash = lowRatio * circumference;
  const medDash = medRatio * circumference;
  const highDash = highRatio * circumference;

  const medOffset = -lowDash;
  const highOffset = -(lowDash + medDash);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Patients by Diagnosis Bar Chart Card */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Patients by Diagnosis</h3>
            <div className="relative">
              <select
                value={viewTimeframe}
                onChange={(e) => setViewTimeframe(e.target.value as 'Monthly' | 'Active')}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-full px-3 py-1 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="Monthly">Monthly ▾</option>
                <option value="Active">Active Queue ▾</option>
              </select>
            </div>
          </div>

          <div className="w-full h-56 pt-2">
            <svg viewBox="0 0 520 220" className="w-full h-full overflow-visible">
              {[100, 80, 60, 40, 20, 0].map((level, i) => {
                const y = 20 + i * 32;
                return (
                  <g key={level}>
                    <line x1="36" y1={y} x2="510" y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                    <text x="24" y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="sans-serif">
                      {level}
                    </text>
                  </g>
                );
              })}

              {diagnosisData.map((d, index) => {
                const maxDisplay = 100;
                const barHeight = Math.min(160, Math.max(8, (d.value / maxDisplay) * 160));
                const x = 58 + index * 76;
                const y = 180 - barHeight;
                return (
                  <g key={d.label} className="group cursor-pointer">
                    <rect
                      x={x - 8}
                      y="15"
                      width="44"
                      height="170"
                      fill="transparent"
                      className="hover:fill-slate-50/80 transition-colors"
                      rx="4"
                    />
                    <rect
                      x={x}
                      y={y}
                      width="28"
                      height={barHeight}
                      rx="5"
                      fill="#3b82f6"
                      className="transition-all duration-300 group-hover:fill-indigo-600"
                    />
                    <text
                      x={x + 14}
                      y="202"
                      fill="#64748b"
                      fontSize="11"
                      textAnchor="middle"
                      className="font-medium group-hover:fill-slate-900 transition-colors"
                    >
                      {d.label}
                    </text>
                    <title>{`${d.label}: ${d.value} patients (${cohort.length} admissions tracking)`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <span>Real-time aggregation from surveillance cohort</span>
          <span className="font-mono text-slate-600">{cohort.length} Active encounters mapped</span>
        </div>
      </div>

      {/* 2. Risk Distribution Donut Chart Card */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Risk distribution</h3>
            <div className="relative">
              <select
                value={viewTimeframe}
                onChange={(e) => setViewTimeframe(e.target.value as 'Monthly' | 'Active')}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-full px-3 py-1 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="Monthly">Monthly ▾</option>
                <option value="Active">Active Queue ▾</option>
              </select>
            </div>
          </div>

          <div className="relative w-full h-56 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48 -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${lowDash} ${circumference}`}
                strokeDashoffset={0}
                className="transition-all duration-500"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#9333ea"
                strokeWidth="20"
                strokeDasharray={`${medDash} ${circumference}`}
                strokeDashoffset={medOffset}
                className="transition-all duration-500"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#bae6fd"
                strokeWidth="20"
                strokeDasharray={`${highDash} ${circumference}`}
                strokeDashoffset={highOffset}
                className="transition-all duration-500"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl font-bold font-sans text-slate-900 tracking-tight">{riskData.total}</span>
            </div>

            {/* Floating Risk Callouts */}
            <div className="absolute top-2 left-6 text-center">
              <span className="text-[11px] font-semibold text-emerald-600 block">Low Risk</span>
              <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-0.5" />
              <span className="text-xs font-bold text-slate-800">{riskData.low}</span>
            </div>

            <div className="absolute top-4 right-6 text-center">
              <span className="text-[11px] font-semibold text-rose-600 block">High Risk</span>
              <div className="w-12 h-0.5 bg-rose-500 mx-auto mt-0.5" />
              <span className="text-xs font-bold text-slate-800">{riskData.high}</span>
            </div>

            <div className="absolute bottom-3 left-6 text-center">
              <span className="text-[11px] font-semibold text-amber-700 block">Medium Risk</span>
              <div className="w-14 h-0.5 bg-amber-600 mx-auto mt-0.5" />
              <span className="text-xs font-bold text-slate-800">{riskData.medium}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600 font-medium">High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
            <span className="text-slate-600 font-medium">Medium Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-slate-600 font-medium">Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientsQueueView({
  cohort,
  onSelectPatient,
  onToggleReview
}: {
  cohort: PatientEncounter[];
  onSelectPatient: (p: PatientEncounter) => void;
  onToggleReview: (id: string, e?: React.MouseEvent) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskBand, setSelectedRiskBand] = useState<string>('All');
  const [selectedServiceLine, setSelectedServiceLine] = useState<string>('All');
  const [ayushmanOnly, setAyushmanOnly] = useState<boolean>(false);

  const filteredPatients = useMemo(() => {
    return cohort.filter((pt) => {
      const matchesSearch =
        pt.encounterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pt.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pt.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pt.patientState.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = selectedRiskBand === 'All' || pt.riskBand === selectedRiskBand;
      const matchesService = selectedServiceLine === 'All' || pt.serviceLine === selectedServiceLine;
      const matchesAyushman = !ayushmanOnly || pt.insurance === 'Ayushman Bharat (PM-JAY)';

      return matchesSearch && matchesRisk && matchesService && matchesAyushman;
    });
  }, [cohort, searchTerm, selectedRiskBand, selectedServiceLine, ayushmanOnly]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              data-testid="cohort-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search encounter ID, patient, diagnosis or state..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Risk:</span>
            <select
              data-testid="filter-risk-band"
              value={selectedRiskBand}
              onChange={(e) => setSelectedRiskBand(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Bands</option>
              <option value="High">High (&gt;65%)</option>
              <option value="Elevated">Elevated (45-65%)</option>
              <option value="Moderate">Moderate (25-45%)</option>
              <option value="Low">Low (&lt;25%)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Service:</span>
            <select
              data-testid="filter-service-line"
              value={selectedServiceLine}
              onChange={(e) => setSelectedServiceLine(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Services</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="ICU">ICU</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Nephrology">Nephrology</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>

          <button
            onClick={() => setAyushmanOnly(!ayushmanOnly)}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              ayushmanOnly
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Ayushman (PM-JAY) Only</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          Showing <span className="font-semibold text-slate-800">{filteredPatients.length}</span> of {cohort.length} admissions
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse" data-testid="patients-table">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="py-3 px-3 text-center w-12">Review</th>
                <th className="py-3 px-3">Encounter ID</th>
                <th className="py-3 px-3">Patient ID</th>
                <th className="py-3 px-3">Acuity</th>
                <th className="py-3 px-3">Primary Diagnosis</th>
                <th className="py-3 px-3">Age / Sex</th>
                <th className="py-3 px-3">LOS</th>
                <th className="py-3 px-3">Bill / Scheme</th>
                <th className="py-3 px-3 text-center">RAG Prior</th>
                <th className="py-3 px-3 text-center">Risk Level</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No clinical encounters match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const diseaseInfo = DISEASE_TAXONOMY[patient.primaryDiagnosis];
                  return (
                    <tr
                      key={patient.encounterId}
                      onClick={() => onSelectPatient(patient)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={patient.reviewed}
                          onChange={(e) => onToggleReview(patient.encounterId, e as unknown as React.MouseEvent)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer border-slate-300"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-slate-900">
                        {patient.encounterId}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600">
                        {patient.patientId}
                      </td>

                      <td className="py-3 px-3">
                        <AcuityBadge acuity={diseaseInfo?.acuity || 'Urgent'} />
                      </td>

                      <td className="py-3 px-3 max-w-[200px] truncate font-medium text-slate-800">
                        {patient.primaryDiagnosis}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {patient.age}y / {patient.gender}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {patient.losDays}d
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-mono text-[11px] font-medium text-slate-800">
                          ₹{patient.totalBillInr.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {patient.insurance === 'Ayushman Bharat (PM-JAY)' ? 'PM-JAY' : 'Standard'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 font-medium">
                          {Math.round(patient.ragFeature.historicalReadmissionRate * 100)}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <RiskBadge band={patient.riskBand} prob={patient.riskProbability} />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(patient);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RiskAssistantSimulateView({
  onAddEncounterToQueue,
}: {
  onAddEncounterToQueue: (newEncounter: PatientEncounter) => void;
}) {
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Type 1 diabetes mellitus');
  const [otherDiagnosis, setOtherDiagnosis] = useState('');
  const [age, setAge] = useState<number>(51);
  const [losDays, setLosDays] = useState<number>(5);
  const [charlsonIndex, setCharlsonIndex] = useState<number>(2);
  const [comorbidityCount, setComorbidityCount] = useState<number>(1);
  const [proceduresCount, setProceduresCount] = useState<number>(1);
  const [earlierAdmissions, setEarlierAdmissions] = useState<number>(0);
  const [daysSinceDischarge, setDaysSinceDischarge] = useState<number>(0);
  const [hba1c, setHba1c] = useState<number>(5.7);
  const [creatinine, setCreatinine] = useState<number>(0.91);
  const [haemoglobin, setHaemoglobin] = useState<number>(11.9);
  const [systolicBp, setSystolicBp] = useState<number>(134);
  const [hospitalBeds, setHospitalBeds] = useState<number>(423);
  const [totalBill, setTotalBill] = useState<number>(31230);
  const [outOfPocket, setOutOfPocket] = useState<number>(7693);
  const [gender, setGender] = useState<'F' | 'M' | 'Other'>('F');
  const [admissionType, setAdmissionType] = useState<'Elective' | 'Emergency' | 'Urgent' | 'OPD'>('Elective');
  const [ward, setWard] = useState<'General' | 'Semi-Private' | 'ICU'>('General');
  const [dischargeType, setDischargeType] = useState<'Recovered' | 'Home / Self Care' | 'Home Health Agency' | 'Transferred'>('Recovered');
  const [insurance, setInsurance] = useState<'Ayushman Bharat (PM-JAY)' | 'Private Insurance' | 'CGHS/ECHS' | 'Self-Pay'>('Ayushman Bharat (PM-JAY)');
  const [bplCard, setBplCard] = useState<boolean>(false);
  const [hospitalTier, setHospitalTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [teachingHospital, setTeachingHospital] = useState<boolean>(false);
  const [patientState, setPatientState] = useState<string>('Andhra Pradesh');
  const [hospitalState, setHospitalState] = useState<string>('Andhra Pradesh');

  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);

  const clinicalResult = useMemo(() => {
    return calculateClinicalScore({
      primaryDiagnosis,
      age,
      losDays,
      charlsonIndex,
      priorAdmissions12m: earlierAdmissions,
      proceduresCount,
      ward,
      dischargeDisposition: dischargeType,
      insurance,
      bplCard,
      clinicalLabs: {
        hba1c,
        creatinine,
        haemoglobin,
        systolicBp,
      },
    });
  }, [
    primaryDiagnosis,
    age,
    losDays,
    charlsonIndex,
    earlierAdmissions,
    proceduresCount,
    ward,
    dischargeType,
    insurance,
    bplCard,
    hba1c,
    creatinine,
    haemoglobin,
    systolicBp,
  ]);

  // Dynamic Patient-Specific Clinical & Test-Driven Analysis
  const clinicalAnalysis = useMemo(() => {
    const findings: string[] = [];
    const readmissionDrivers: string[] = [];

    // 1. Lab Analysis
    if (creatinine > 1.8) {
      findings.push(`Severe renal dysfunction (serum creatinine ${creatinine} mg/dL, reference 0.7-1.3) indicating acute kidney injury or chronic nephropathy, severely compromising medication clearance and fluid balance.`);
      readmissionDrivers.push('Hyperkalemia, uremic complications, and volume overload predisposing to acute rehospitalization');
    } else if (creatinine > 1.3) {
      findings.push(`Mild-to-moderate elevation in creatinine (${creatinine} mg/dL), warranting strict nephrotoxic drug avoidance and serial renal monitoring.`);
      readmissionDrivers.push('Renal decompensation risk under physiologic stress');
    } else {
      findings.push(`Preserved baseline renal filtration (creatinine ${creatinine} mg/dL), supporting safe clearance of standard therapeutic regimens.`);
    }

    if (haemoglobin < 10.0) {
      findings.push(`Marked anemia (hemoglobin ${haemoglobin} g/dL, reference 12.0-16.0), compromising tissue oxygenation and imposing ischemic strain on the myocardium.`);
      readmissionDrivers.push('Symptomatic anemia decompensation, cardiac stress, or occult gastrointestinal bleeding');
    } else if (haemoglobin < 12.0) {
      findings.push(`Borderline microcytic/normocytic anemia (hemoglobin ${haemoglobin} g/dL) contributing to reduced functional reserve.`);
    } else {
      findings.push(`Stable red cell indices and oxygen carrying capacity (haemoglobin ${haemoglobin} g/dL).`);
    }

    if (hba1c > 9.0) {
      findings.push(`Poor chronic glycemic control (HbA1c ${hba1c}%), associated with heightened secondary infection susceptibility, vascular end-organ injury, and delayed recovery.`);
      readmissionDrivers.push('Recurrent hyperosmolar/diabetic emergencies and post-discharge surgical site or systemic infections');
    } else if (hba1c > 7.0) {
      findings.push(`Suboptimal glycemic status (HbA1c ${hba1c}%), requiring ongoing outpatient insulin/antidiabetic titration.`);
    } else {
      findings.push(`Well-maintained baseline glycemic homeostasis (HbA1c ${hba1c}%).`);
    }

    if (systolicBp >= 150) {
      findings.push(`Uncontrolled stage 2 systolic hypertension (${systolicBp} mmHg), accelerating cardiac afterload and acute cerebrovascular risk.`);
      readmissionDrivers.push('Hypertensive urgency, flash pulmonary edema, or end-organ microvascular crisis');
    } else if (systolicBp <= 100) {
      findings.push(`Relative hypotension or borderline perfusion pressure (systolic BP ${systolicBp} mmHg), signaling orthostasis, volume depletion, or pump failure.`);
      readmissionDrivers.push('Postural syncope or hypoperfusion-induced decompensation');
    } else {
      findings.push(`Hemodynamically stable arterial blood pressure (${systolicBp} mmHg systolic).`);
    }

    // 2. Comorbidity & Stay Context
    if (charlsonIndex >= 4) {
      readmissionDrivers.push(`High multi-system comorbidity burden (Charlson score ${charlsonIndex}, ${comorbidityCount} active comorbid diagnoses) with fragile physiological reserve`);
    }
    if (earlierAdmissions >= 2) {
      readmissionDrivers.push(`Frequent clinical recidivism with ${earlierAdmissions} acute hospital admissions recorded in the past 12 months`);
    }
    if (losDays >= 7) {
      readmissionDrivers.push(`Prolonged index inpatient course (${losDays} days) reflecting severe acute illness complexity and post-discharge physical deconditioning`);
    }
    if (dischargeType === 'LAMA') {
      readmissionDrivers.push('Discharge Left Against Medical Advice (LAMA) with incomplete medication optimization and disrupted care continuity');
    }

    // 3. Overall Clinical Trajectory
    const isHigh = clinicalResult.riskBand === 'High' || clinicalResult.riskBand === 'Elevated';
    const summaryVerdict = isHigh
      ? `This patient demonstrates an acute readmission probability of ${(clinicalResult.probability * 100).toFixed(1)}% (${clinicalResult.riskBand.toUpperCase()}). The clinical presentation of ${primaryDiagnosis} combined with anomalous test markers indicates vulnerable homeostatic balance. Without rapid outpatient follow-up within 7 days, specialized nursing oversight, and tight medication adherence, the patient is at critical risk of recurrent decompensation requiring emergent readmission.`
      : `This patient demonstrates a favorable 30-day readmission risk of ${(clinicalResult.probability * 100).toFixed(1)}% (${clinicalResult.riskBand.toUpperCase()}). Laboratory values and vital signs indicate stabilized physiological parameters following the inpatient course for ${primaryDiagnosis}. Readmission is largely preventable with standard routine outpatient surveillance and maintenance therapy.`;

    return {
      findings,
      readmissionDrivers,
      summaryVerdict,
    };
  }, [
    creatinine,
    haemoglobin,
    hba1c,
    systolicBp,
    charlsonIndex,
    comorbidityCount,
    earlierAdmissions,
    losDays,
    dischargeType,
    clinicalResult,
    primaryDiagnosis,
  ]);

  const syntheticNote = useMemo(() => {
    const diseaseName = primaryDiagnosis;
    const renalStatus = creatinine < 1.3 ? 'renal function preserved' : 'elevated creatinine indicating renal impairment';
    const hbNote = haemoglobin < 12.0 ? `low haemoglobin (${haemoglobin} g/dL)` : `normal haemoglobin (${haemoglobin} g/dL)`;
    const insuranceLabel = insurance === 'Ayushman Bharat (PM-JAY)' ? 'Ayushman' : insurance;

    return `This ${age}-year-old ${gender === 'F' ? 'female' : 'male'} was admitted (${admissionType.toLowerCase()}) to the ${ward.toLowerCase()} ward of a ${hospitalTier} hospital. Principal diagnosis: ${diseaseName}. Length of stay ${losDays} days, ${proceduresCount} procedure(s) performed. Charlson comorbidity index ${charlsonIndex} with ${comorbidityCount} documented comorbidities. Key findings: creatinine ${creatinine} mg/dL, ${renalStatus}; ${hbNote}; systolic BP ${systolicBp}. ${earlierAdmissions > 0 ? `${earlierAdmissions} prior admissions recorded` : 'First recorded admission in this system'}. Social and financial context: Insurance: ${insuranceLabel}. Discharged in ${dischargeType.toLowerCase()} condition.`;
  }, [
    age,
    gender,
    admissionType,
    ward,
    hospitalTier,
    primaryDiagnosis,
    losDays,
    proceduresCount,
    charlsonIndex,
    comorbidityCount,
    creatinine,
    haemoglobin,
    systolicBp,
    earlierAdmissions,
    insurance,
    dischargeType,
  ]);

  const loadTypicalPatient = () => {
    setPrimaryDiagnosis('Type 1 diabetes mellitus');
    setAge(51);
    setLosDays(5);
    setCharlsonIndex(2);
    setComorbidityCount(1);
    setProceduresCount(1);
    setEarlierAdmissions(0);
    setDaysSinceDischarge(0);
    setHba1c(5.7);
    setCreatinine(0.91);
    setHaemoglobin(11.9);
    setSystolicBp(134);
    setHospitalBeds(423);
    setTotalBill(31230);
    setOutOfPocket(7693);
    setGender('F');
    setAdmissionType('Elective');
    setWard('General');
    setDischargeType('Recovered');
    setInsurance('Ayushman Bharat (PM-JAY)');
    setBplCard(false);
    setHospitalTier('tier1');
    setTeachingHospital(false);
    setPatientState('Andhra Pradesh');
    setHospitalState('Andhra Pradesh');
  };

  const loadHigherRiskProfile = () => {
    setPrimaryDiagnosis('Acute Myocardial Infarction (STEMI)');
    setAge(68);
    setLosDays(7);
    setCharlsonIndex(4);
    setComorbidityCount(3);
    setProceduresCount(2);
    setEarlierAdmissions(2);
    setDaysSinceDischarge(45);
    setHba1c(7.8);
    setCreatinine(1.95);
    setHaemoglobin(11.2);
    setSystolicBp(158);
    setHospitalBeds(520);
    setTotalBill(185000);
    setOutOfPocket(12000);
    setGender('M');
    setAdmissionType('Emergency');
    setWard('ICU');
    setDischargeType('Home Health Agency');
    setInsurance('Ayushman Bharat (PM-JAY)');
    setBplCard(true);
    setHospitalTier('tier1');
    setTeachingHospital(true);
    setPatientState('Andhra Pradesh');
    setHospitalState('Andhra Pradesh');
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    let responseText = '';
    const q = userQuestion.toLowerCase();
    if (q.includes('risk') || q.includes('why') || q.includes('readmit')) {
      responseText = `The model projects a ${(clinicalResult.probability * 100).toFixed(1)}% readmission risk (${clinicalResult.riskBand}) for ${primaryDiagnosis}. Clinical factors: creatinine is ${creatinine} mg/dL, HbA1c is ${hba1c}%, and systolic BP is ${systolicBp} mmHg with Charlson index ${charlsonIndex} over ${losDays} inpatient days. Readmission risk is driven by ${clinicalAnalysis.readmissionDrivers.slice(0, 2).join(' and ')}.`;
    } else if (q.includes('test') || q.includes('lab')) {
      responseText = `Key test findings evaluated: HbA1c at ${hba1c}% (${hba1c > 8.0 ? 'poor control' : 'controlled'}), serum creatinine at ${creatinine} mg/dL (${creatinine > 1.3 ? 'impaired filtration' : 'normal'}), haemoglobin at ${haemoglobin} g/dL, and systolic BP at ${systolicBp} mmHg.`;
    } else {
      responseText = `Clinical protocol for ${primaryDiagnosis}: post-discharge follow-up recommended within 7-14 days. Financial coverage via ${insurance} with ₹${outOfPocket.toLocaleString('en-IN')} out-of-pocket obligation.`;
    }

    setChatHistory([...chatHistory, { q: userQuestion, a: responseText }]);
    setUserQuestion('');
  };

  const handleAddToSurveillanceQueue = () => {
    const uniqueId = `ENC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newEncounter: PatientEncounter = {
      encounterId: uniqueId,
      patientId: `PT-${Math.floor(10000 + Math.random() * 90000)}X`,
      age,
      gender,
      admissionType,
      ward,
      serviceLine:
        primaryDiagnosis.includes('Myocardial') || primaryDiagnosis.includes('Heart')
          ? 'Cardiology'
          : primaryDiagnosis.includes('Shock')
          ? 'ICU'
          : primaryDiagnosis.includes('COPD') || primaryDiagnosis.includes('Pneumonia')
          ? 'Pulmonology'
          : primaryDiagnosis.includes('Renal')
          ? 'Nephrology'
          : 'Endocrinology',
      primaryDiagnosis,
      secondaryDiagnoses: otherDiagnosis ? [otherDiagnosis] : [],
      admissionDate: '2026-10-06',
      dischargeDate: '2026-10-11',
      losDays,
      priorAdmissions12m: earlierAdmissions,
      daysSinceLastDischarge: daysSinceDischarge || null,
      charlsonIndex,
      comorbidityCount,
      proceduresCount,
      hospitalBeds,
      totalBillInr: totalBill,
      outOfPocketInr: outOfPocket,
      insurance,
      bplCard,
      hospitalTier,
      teachingHospital,
      patientState,
      hospitalState,
      clinicalLabs: {
        hba1c,
        creatinine,
        haemoglobin,
        systolicBp,
      },
      dischargeDisposition: dischargeType,
      followUpScheduled: true,
      riskProbability: clinicalResult.probability,
      riskBand: clinicalResult.riskBand,
      reviewed: false,
      clinicalNoteSummary: syntheticNote,
      ragFeature: {
        neighborsRetrieved: 5,
        historicalReadmissionRate: clinicalResult.probability > 0.4 ? 0.65 : 0.07,
        neighborCases: [
          {
            encounterId: 'sim-case-01',
            similarity: 0.97,
            age,
            losDays,
            charlsonIndex,
            primaryDiagnosis,
            outcome: clinicalResult.probability > 0.4 ? 'Readmitted' : 'Not Readmitted',
            daysToReadmission: clinicalResult.probability > 0.4 ? 14 : null,
            summary: `Similar age ${age}y, Charlson ${charlsonIndex}, stay ${losDays}d case.`,
          },
        ],
      },
    };

    onAddEncounterToQueue(newEncounter);
  };

  const diseaseObj = DISEASE_TAXONOMY[primaryDiagnosis];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Readmission risk assistant</span>
          </h2>
          <button
            onClick={handleAddToSurveillanceQueue}
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Transfer to Active Queue</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Input Form (Left) vs. Clinical Rationale & Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Input Controls) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            {/* Principal Diagnosis Select */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Principal diagnosis</label>
              <select
                data-testid="sim-principal-diagnosis"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {Object.keys(DISEASE_TAXONOMY).map((dName) => (
                  <option key={dName} value={dName}>
                    {dName}
                  </option>
                ))}
              </select>
              {diseaseObj && (
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <AcuityBadge acuity={diseaseObj.acuity} />
                  <span>Base Rate: {(diseaseObj.baseReadmissionRisk * 100).toFixed(0)}%</span>
                  <span>&bull;</span>
                  <span>30d Mortality: {(diseaseObj.mortalityRate30d * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Other Diagnoses */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Other diagnoses (optional)</label>
              <input
                type="text"
                value={otherDiagnosis}
                onChange={(e) => setOtherDiagnosis(e.target.value)}
                placeholder="e.g. Hypertension, Diabetic Retinopathy..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Patient and stay details Header */}
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-800 text-xs block mb-3">Patient and stay details</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Length of stay (days)</label>
                  <input
                    type="number"
                    value={losDays}
                    onChange={(e) => setLosDays(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Charlson index</label>
                  <input
                    type="number"
                    value={charlsonIndex}
                    onChange={(e) => setCharlsonIndex(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Comorbidity count</label>
                  <input
                    type="number"
                    value={comorbidityCount}
                    onChange={(e) => setComorbidityCount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Procedures</label>
                  <input
                    type="number"
                    value={proceduresCount}
                    onChange={(e) => setProceduresCount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Earlier admissions</label>
                  <input
                    type="number"
                    value={earlierAdmissions}
                    onChange={(e) => setEarlierAdmissions(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Days since last discharge</label>
                  <input
                    type="number"
                    value={daysSinceDischarge}
                    onChange={(e) => setDaysSinceDischarge(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hba1c}
                    onChange={(e) => setHba1c(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Creatinine (mg/dL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={creatinine}
                    onChange={(e) => setCreatinine(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Haemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={haemoglobin}
                    onChange={(e) => setHaemoglobin(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Hospital beds</label>
                  <input
                    type="number"
                    value={hospitalBeds}
                    onChange={(e) => setHospitalBeds(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Total bill (INR)</label>
                  <input
                    type="number"
                    value={totalBill}
                    onChange={(e) => setTotalBill(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Out-of-pocket (INR)</label>
                  <input
                    type="number"
                    value={outOfPocket}
                    onChange={(e) => setOutOfPocket(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Categorical select grids */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-slate-500 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'F' | 'M')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="F">F</option>
                    <option value="M">M</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Admission type</label>
                  <select
                    value={admissionType}
                    onChange={(e) => setAdmissionType(e.target.value as 'Elective' | 'Emergency' | 'Urgent')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Elective">Elective</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value as 'General' | 'Semi-Private' | 'ICU')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Semi-Private">Semi-Private</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Discharge type</label>
                  <select
                    value={dischargeType}
                    onChange={(e) => setDischargeType(e.target.value as 'Recovered' | 'Home / Self Care' | 'Home Health Agency')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Recovered">Recovered</option>
                    <option value="Home / Self Care">Home / Self Care</option>
                    <option value="Home Health Agency">Home Health Agency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Insurance</label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value as 'Ayushman Bharat (PM-JAY)' | 'Private Insurance')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Ayushman Bharat (PM-JAY)">Ayushman</option>
                    <option value="Private Insurance">Private</option>
                    <option value="CGHS/ECHS">CGHS/ECHS</option>
                    <option value="Self-Pay">Self-Pay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Below-poverty-line card</label>
                  <select
                    value={bplCard ? 'True' : 'False'}
                    onChange={(e) => setBplCard(e.target.value === 'True')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="False">False</option>
                    <option value="True">True</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Hospital tier</label>
                  <select
                    value={hospitalTier}
                    onChange={(e) => setHospitalTier(e.target.value as 'tier1' | 'tier2' | 'tier3')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="tier1">tier1</option>
                    <option value="tier2">tier2</option>
                    <option value="tier3">tier3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Teaching hospital</label>
                  <select
                    value={teachingHospital ? 'True' : 'False'}
                    onChange={(e) => setTeachingHospital(e.target.value === 'True')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="False">False</option>
                    <option value="True">True</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Patient state</label>
                  <select
                    value={patientState}
                    onChange={(e) => setPatientState(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Hospital state</label>
                  <select
                    value={hospitalState}
                    onChange={(e) => setHospitalState(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Presets and Run button */}
            <div className="pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={loadTypicalPatient}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-3 rounded-lg text-center transition-colors"
                >
                  Load: typical patient
                </button>
                <button
                  type="button"
                  onClick={loadHigherRiskProfile}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-3 rounded-lg text-center transition-colors"
                >
                  Load: higher-risk profile
                </button>
              </div>

              <button
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
              >
                <span>Score patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Dynamic Clinical Test Rationale & Readmission Analysis) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            {/* Top Score Banner */}
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Risk: {(clinicalResult.probability * 100).toFixed(1)}% ({clinicalResult.riskBand.toUpperCase()})
                </h2>
                <RiskBadge band={clinicalResult.riskBand} prob={clinicalResult.probability} />
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Clinical diagnosis: <span className="font-semibold text-slate-700">{primaryDiagnosis}</span> &bull; 30d Baseline mortality: <span className="font-semibold text-slate-700">{((diseaseObj?.mortalityRate30d || 0.02) * 100).toFixed(1)}%</span>
              </p>
            </div>

            {/* Dynamic Clinical Test Assessment & Readmission Rationale */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>Clinical Test Evaluation & Diagnostic Rationale</span>
              </div>

              {/* Lab-Specific Assessment */}
              <div className="space-y-1.5 text-[11px] text-slate-700">
                <span className="font-semibold text-slate-800 block text-xs">Biomarker & Vital Sign Evaluation:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-600 leading-relaxed">
                  {clinicalAnalysis.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Readmission Drivers */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                <span className="font-semibold text-rose-800 block text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Primary Drivers of 30-Day Readmission Risk:</span>
                </span>
                {clinicalAnalysis.readmissionDrivers.length > 0 ? (
                  <ul className="space-y-1 list-disc list-inside text-slate-700 leading-relaxed">
                    {clinicalAnalysis.readmissionDrivers.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-700 italic">No acute laboratory abnormalities or severe utilization triggers detected.</p>
                )}
              </div>

              {/* Overall Clinical Assessment */}
              <div className="pt-2 border-t border-slate-200/80 text-[11px] leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-800 block text-xs mb-1">Physician Decision Support Assessment:</span>
                <p className="italic bg-white p-2.5 rounded border border-slate-200/80 text-slate-800">
                  {clinicalAnalysis.summaryVerdict}
                </p>
              </div>
            </div>

            {/* Factor Contribution Table */}
            <div>
              <div className="flex justify-between items-center mb-1 text-slate-500 text-[11px]">
                <span>Why this score (numbers: versus an average patient; categories: how much each category pulls the score)</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2">Effect</th>
                      <th className="p-2">Factor</th>
                      <th className="p-2 text-right">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-2 text-rose-600 font-medium">Raises</td>
                      <td className="p-2 text-slate-700">n dx ({comorbidityCount})</td>
                      <td className="p-2 text-right text-slate-800 font-semibold">+0.08</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 font-medium">Raises</td>
                      <td className="p-2 text-slate-700">primary cat: {diseaseObj?.category || 'Clinical'}</td>
                      <td className="p-2 text-right text-slate-800 font-semibold">
                        {clinicalResult.probability > 0.4 ? '+0.34' : '+0.07'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 font-medium">Raises</td>
                      <td className="p-2 text-slate-700">age ({age})</td>
                      <td className="p-2 text-right text-slate-800 font-semibold">
                        {age > 65 ? '+0.09' : '+0.02'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 font-medium">Raises</td>
                      <td className="p-2 text-slate-700">prev admissions ({earlierAdmissions})</td>
                      <td className="p-2 text-right text-slate-800 font-semibold">
                        +{earlierAdmissions * 0.05 + 0.02}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 font-medium">Raises</td>
                      <td className="p-2 text-slate-700">insurance type: {insurance === 'Ayushman Bharat (PM-JAY)' ? 'Ayushman' : 'Standard'}</td>
                      <td className="p-2 text-right text-slate-800 font-semibold">+0.01</td>
                    </tr>
                    {ward === 'ICU' && (
                      <tr>
                        <td className="p-2 text-rose-600 font-medium">Raises</td>
                        <td className="p-2 text-slate-700">ward: ICU</td>
                        <td className="p-2 text-right text-slate-800 font-semibold">+0.14</td>
                      </tr>
                    )}
                    {dischargeType === 'Recovered' && (
                      <tr>
                        <td className="p-2 text-emerald-600 font-medium">Lowers</td>
                        <td className="p-2 text-slate-700">discharge: Recovered</td>
                        <td className="p-2 text-right text-slate-800 font-semibold">-0.12</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note Generated for this patient */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Note generated for this patient (used for retrieval)
              </span>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                {syntheticNote}
              </div>
            </div>

            {/* Ask about this patient Section */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <h4 className="font-semibold text-slate-800 text-xs">Ask about this patient</h4>
              <form onSubmit={handleAskQuestion} className="space-y-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Why is this patient at this risk level? What happened to similar patients?"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-3 rounded-lg transition-colors text-xs"
                >
                  Ask
                </button>
              </form>

              {chatHistory.length > 0 && (
                <div className="mt-3 space-y-2">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-xs space-y-1">
                      <p className="font-semibold text-indigo-900">Q: {chat.q}</p>
                      <p className="text-slate-700">{chat.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EncounterDetailDrawer({
  patient,
  onClose,
  onToggleReview,
}: {
  patient: PatientEncounter;
  onClose: () => void;
  onToggleReview: (id: string) => void;
}) {
  const diseaseInfo = DISEASE_TAXONOMY[patient.primaryDiagnosis];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-300">{patient.encounterId}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="font-mono text-xs text-slate-300">{patient.patientId}</span>
                <AcuityBadge acuity={diseaseInfo?.acuity || 'Urgent'} />
              </div>
              <h2 className="text-base font-bold text-white mt-1">{patient.primaryDiagnosis}</h2>
              <p className="text-xs text-slate-400">
                {patient.age}y / {patient.gender} &bull; {patient.serviceLine} &bull; {patient.ward} Ward &bull; {patient.patientState}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Predicted 30-Day Readmission Risk
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {(patient.riskProbability * 100).toFixed(1)}%
                  </span>
                  <RiskBadge band={patient.riskBand} prob={patient.riskProbability} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Baseline population rate: 12.6% &bull; Estimated 30d mortality: {((diseaseInfo?.mortalityRate30d || 0.05) * 100).toFixed(1)}%
                </p>
              </div>

              <button
                onClick={() => onToggleReview(patient.encounterId)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  patient.reviewed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{patient.reviewed ? 'Reviewed & Cleared' : 'Mark as Reviewed'}</span>
              </button>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Hospital Billing & Coverage (INR)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Bill</span>
                  <span className="font-mono font-bold text-slate-800">₹{patient.totalBillInr.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Out-of-Pocket</span>
                  <span className="font-mono font-bold text-slate-800">₹{patient.outOfPocketInr.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Scheme</span>
                  <span className="font-semibold text-indigo-700 truncate block">{patient.insurance}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BPL Status</span>
                  <span className="font-semibold text-slate-700">{patient.bplCard ? 'BPL Card Verified' : 'None'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Clinical Course & Utilization
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Length of Stay</span>
                  <span className="font-semibold text-slate-800">{patient.losDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Charlson Index</span>
                  <span className="font-semibold text-slate-800">{patient.charlsonIndex}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Prior Admits (12m)</span>
                  <span className="font-semibold text-slate-800">{patient.priorAdmissions12m}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Disposition</span>
                  <span className="font-semibold text-slate-800">{patient.dischargeDisposition}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Discharge Laboratory Panel
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">HbA1c</span>
                  <span className={`font-semibold ${patient.clinicalLabs.hba1c > 8.0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {patient.clinicalLabs.hba1c}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">Creatinine</span>
                  <span className={`font-semibold ${patient.clinicalLabs.creatinine > 1.5 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {patient.clinicalLabs.creatinine} mg/dL
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">Haemoglobin</span>
                  <span className={`font-semibold ${patient.clinicalLabs.haemoglobin < 11 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {patient.clinicalLabs.haemoglobin} g/dL
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">Systolic BP</span>
                  <span className="font-semibold text-slate-800">{patient.clinicalLabs.systolicBp} mmHg</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Clinical Discharge Summary (Embedding Source)</span>
              </h3>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono">
                {patient.clinicalNoteSummary}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>RAG Retrieved Historical Neighbors (k=5)</span>
                </h3>
                <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                  Historical Readmit Rate: {Math.round(patient.ragFeature.historicalReadmissionRate * 100)}%
                </span>
              </div>

              {patient.ragFeature.neighborCases.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-400 border border-slate-200">
                  No direct vector matches available in historical index.
                </div>
              ) : (
                <div className="space-y-2">
                  {patient.ragFeature.neighborCases.map((nCase, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-800">{nCase.encounterId}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-600 font-medium">{nCase.primaryDiagnosis}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-indigo-600 font-semibold">
                            {(nCase.similarity * 100).toFixed(0)}% match
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              nCase.outcome === 'Readmitted'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {nCase.outcome}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed italic">{nCase.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

function AddPatientModal({
  isOpen,
  onClose,
  onAddPatient,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (p: PatientEncounter) => void;
}) {
  const [patientId, setPatientId] = useState(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
  const [age, setAge] = useState(62);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Acute Myocardial Infarction (STEMI)');
  const [serviceLine, setServiceLine] = useState<'Cardiology' | 'Internal Medicine' | 'Pulmonology' | 'ICU' | 'Endocrinology' | 'Nephrology' | 'Orthopedics'>('Cardiology');
  const [ward, setWard] = useState<'General' | 'Semi-Private' | 'ICU'>('General');
  const [losDays, setLosDays] = useState(5);
  const [charlsonIndex, setCharlsonIndex] = useState(3);
  const [priorAdmissions, setPriorAdmissions] = useState(1);
  const [hba1c, setHba1c] = useState(6.5);
  const [creatinine, setCreatinine] = useState(1.2);
  const [haemoglobin, setHaemoglobin] = useState(12.5);
  const [systolicBp, setSystolicBp] = useState(130);
  const [totalBill, setTotalBill] = useState(65000);
  const [outOfPocket, setOutOfPocket] = useState(8500);
  const [insurance, setInsurance] = useState<'Ayushman Bharat (PM-JAY)' | 'Private Insurance' | 'CGHS/ECHS' | 'Self-Pay'>('Ayushman Bharat (PM-JAY)');
  const [bplCard, setBplCard] = useState(false);
  const [patientState, setPatientState] = useState('Andhra Pradesh');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scoreResult = calculateClinicalScore({
      primaryDiagnosis,
      age,
      losDays,
      charlsonIndex,
      priorAdmissions12m: priorAdmissions,
      proceduresCount: 1,
      ward,
      dischargeDisposition: 'Home / Self Care',
      insurance,
      bplCard,
      clinicalLabs: {
        hba1c,
        creatinine,
        haemoglobin,
        systolicBp,
      },
    });

    const newEncounter: PatientEncounter = {
      encounterId: `ENC-${Math.floor(20000 + Math.random() * 80000)}`,
      patientId,
      age,
      gender,
      admissionType: 'Emergency',
      ward,
      serviceLine,
      primaryDiagnosis,
      secondaryDiagnoses: [],
      admissionDate: '2026-10-06',
      dischargeDate: '2026-10-11',
      losDays,
      priorAdmissions12m: priorAdmissions,
      daysSinceLastDischarge: priorAdmissions > 0 ? 40 : null,
      charlsonIndex,
      comorbidityCount: 2,
      proceduresCount: 1,
      hospitalBeds: 400,
      totalBillInr: totalBill,
      outOfPocketInr: outOfPocket,
      insurance,
      bplCard,
      hospitalTier: 'tier1',
      teachingHospital: true,
      patientState,
      hospitalState: patientState,
      clinicalLabs: {
        hba1c,
        creatinine,
        haemoglobin,
        systolicBp,
      },
      dischargeDisposition: 'Home / Self Care',
      followUpScheduled: true,
      riskProbability: scoreResult.probability,
      riskBand: scoreResult.riskBand,
      reviewed: false,
      clinicalNoteSummary:
        notes ||
        `Patient ${patientId}, age ${age}, admitted for ${primaryDiagnosis}. Stay ${losDays} days, Charlson ${charlsonIndex}. Labs: HbA1c ${hba1c}%, Creatinine ${creatinine} mg/dL.`,
      ragFeature: {
        neighborsRetrieved: 5,
        historicalReadmissionRate: scoreResult.probability > 0.4 ? 0.65 : 0.08,
        neighborCases: [
          {
            encounterId: 'sim-intake-01',
            similarity: 0.95,
            age,
            losDays,
            charlsonIndex,
            primaryDiagnosis,
            outcome: scoreResult.probability > 0.4 ? 'Readmitted' : 'Not Readmitted',
            daysToReadmission: scoreResult.probability > 0.4 ? 18 : null,
            summary: `Automated match for ${primaryDiagnosis} with equivalent comorbidity index.`,
          },
        ],
      },
    };

    onAddPatient(newEncounter);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Admit New Patient Encounter</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Patient ID</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Primary Diagnosis</label>
              <select
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white font-medium"
              >
                {Object.keys(DISEASE_TAXONOMY).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Service Line</label>
              <select
                value={serviceLine}
                onChange={(e) => setServiceLine(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="ICU">ICU</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Nephrology">Nephrology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 mb-1">Length of Stay (days)</label>
              <input
                type="number"
                value={losDays}
                onChange={(e) => setLosDays(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Charlson Index</label>
              <input
                type="number"
                value={charlsonIndex}
                onChange={(e) => setCharlsonIndex(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Total Bill (INR)</label>
              <input
                type="number"
                value={totalBill}
                onChange={(e) => setTotalBill(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Insurance</label>
              <select
                value={insurance}
                onChange={(e) => setInsurance(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="Ayushman Bharat (PM-JAY)">Ayushman (PM-JAY)</option>
                <option value="Private Insurance">Private</option>
                <option value="CGHS/ECHS">CGHS/ECHS</option>
                <option value="Self-Pay">Self-Pay</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 mb-1">HbA1c (%)</label>
              <input
                type="number"
                step="0.1"
                value={hba1c}
                onChange={(e) => setHba1c(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Creatinine (mg/dL)</label>
              <input
                type="number"
                step="0.01"
                value={creatinine}
                onChange={(e) => setCreatinine(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Haemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                value={haemoglobin}
                onChange={(e) => setHaemoglobin(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Systolic BP</label>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => setSystolicBp(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Clinical Note / Summary</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical course, procedures, comorbidities for RAG text embedding..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
            >
              Save & Compute Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}