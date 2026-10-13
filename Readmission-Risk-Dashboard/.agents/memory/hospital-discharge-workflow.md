---
name: Hospital discharge workflow
description: Product intent and safety boundary for the readmission-risk prototype.
---

The intended product is a hospital-facing discharge workflow for doctors, not only an ML research dashboard. Doctors should add an encounter, check prior admissions, review 30-day readmission risk, and mark the encounter reviewed. Keep the prototype synthetic and local unless the user explicitly asks for a secure data integration.

**Why:** The user clarified that the primary perspective is the hospital and the core need is reviewing new patients, their admission history, and their risk.

**How to apply:** Prioritize the care-team workflow in future UI changes. Do not present demo history, heuristic scores, or sample benchmark metrics as real patient data or validated clinical results.
