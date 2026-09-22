# BuildWise AI — API Contract

Base path: `/api`

## Health
GET /api/health

Response:
```json
{"status":"ok"}
```

## Location Search
GET /api/sites/search?q=<query>

Returns normalized display name, latitude, longitude, and source metadata.

## Analysis
POST /api/analysis

Request:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "buildingType": "residential",
  "plotAreaSqFt": 2400,
  "builtUpAreaSqFt": 1800,
  "floors": 2,
  "qualityGrade": "standard",
  "budget": 5000000
}
```

Response contains analysisId, site data, data confidence, factor results, suitability, terrain, environment, orientation, cost, risks/limitations, and sources.

## Get Analysis
GET /api/analysis/:id

## Compare
POST /api/compare
Request:
```json
{"analysisIdA":"...","analysisIdB":"..."}
```

Returns factor-by-factor and cost comparison without unsupported universal claims.

## Report
POST /api/reports/:analysisId
GET /api/reports/:reportId

## Rules
Validate with Zod. Never expose provider secrets/errors. Do not fabricate missing data. Breaking API changes must be documented here before implementation.
