import { Router } from 'express';
import { calculateClinicalScore } from '../clinicalEngine';
export const simulationRouter=Router();
simulationRouter.post('/score',(req,res)=>{
 try { const result=calculateClinicalScore(req.body||{});res.json({...result, disclaimer:'Prototype decision-support estimate only; not a validated clinical prediction or a substitute for clinician judgement.'}); }
 catch { res.status(400).json({error:'Unable to score supplied clinical data'}); }
});
simulationRouter.post('/ask',(req,res)=>{
 const question=String(req.body?.question||'').trim();
 if(!question)return res.status(400).json({error:'question is required'});
 const q=question.toLowerCase();
 let answer='This prototype assistant can explain the dashboard fields and scoring factors. It does not provide diagnosis or treatment recommendations.';
 if(q.includes('creatinine'))answer='The prototype scoring rule adds a risk contribution when creatinine is above 1.8. Interpret the result alongside the patient’s clinical context and local laboratory reference range.';
 else if(q.includes('hba1c')||q.includes('a1c'))answer='The prototype scoring rule adds a risk contribution when HbA1c is above 9. HbA1c interpretation and care decisions require clinician review.';
 else if(q.includes('haemoglobin')||q.includes('hemoglobin'))answer='The prototype scoring rule adds a risk contribution when haemoglobin is below 10. Consider the full clinical picture rather than this rule alone.';
 else if(q.includes('risk'))answer='The demo bands are Low (<25%), Moderate (25–44.9%), Elevated (45–64.9%), and High (65% or above). These thresholds are illustrative and not clinically validated.';
 res.json({answer,disclaimer:'Educational prototype only; not medical advice.'});
});
