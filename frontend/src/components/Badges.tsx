import React from 'react';import type {RiskBand} from '../types/clinical';
export function RiskBadge({risk}:{risk:RiskBand}){return <span className={`badge risk-${risk.toLowerCase()}`}>{risk} risk</span>}
export function AcuityBadge({acuity}:{acuity:string}){return <span className="badge acuity">{acuity}</span>}
