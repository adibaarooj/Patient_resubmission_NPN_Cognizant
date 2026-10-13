# CarePath — Hospital Surveillance Prototype

A modular React + TypeScript frontend and Express + TypeScript backend based on the supplied CarePath architecture document.

## Requirements
- Node.js 18 or later
- npm

## Run the backend
Open a terminal:
```bash
cd carepath/backend
npm install
npm run dev
```
API listens at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

## Run the frontend
Open a second terminal:
```bash
cd carepath/frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## API endpoints
- `GET /api/health`
- `GET /api/encounters`
- `POST /api/encounters`
- `PATCH /api/encounters/:id/toggle-review`
- `DELETE /api/encounters/:id`
- `POST /api/score`
- `POST /api/ask`

The encounter store is in-memory and resets when the backend restarts. The frontend has a small local fallback dataset if the API cannot be reached.

## Important clinical limitation
All cohort records and scoring rules are demo/illustrative. The score is not a validated clinical model, does not establish medical risk, and must not be used for patient care, diagnosis, triage, or treatment decisions. Do not enter identifiable or real patient information.
