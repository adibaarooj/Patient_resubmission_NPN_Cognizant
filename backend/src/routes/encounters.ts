import { Router } from 'express';
import { INITIAL_COHORT } from '../data/cohortData';
import { PatientEncounter } from '../types';
export const encountersRouter=Router();
let cohort:PatientEncounter[]=[...INITIAL_COHORT];
encountersRouter.get('/',(_req,res)=>res.json(cohort));
encountersRouter.post('/',(req,res)=>{
 const body=req.body as PatientEncounter;
 if(!body||!body.encounterId||!body.patientId)return res.status(400).json({error:'encounterId and patientId are required'});
 if(cohort.some(p=>p.encounterId===body.encounterId))return res.status(409).json({error:'Encounter ID already exists'});
 cohort=[body,...cohort];res.status(201).json(body);
});
encountersRouter.patch('/:id/toggle-review',(req,res)=>{
 const target=cohort.find(p=>p.encounterId===req.params.id);
 if(!target)return res.status(404).json({error:'Encounter not found'});
 target.reviewed=!target.reviewed;res.json(target);
});
encountersRouter.delete('/:id',(req,res)=>{
 const before=cohort.length;cohort=cohort.filter(p=>p.encounterId!==req.params.id);
 if(before===cohort.length)return res.status(404).json({error:'Encounter not found'});
 res.status(204).send();
});
