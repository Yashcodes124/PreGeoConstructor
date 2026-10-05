# BuildWise AI — API Contract

Base path: `/api`

Validate with Zod. Never expose provider secrets or raw provider errors. Do not fabricate missing measurements. A missing value is `null` plus an explanation, not an imputed number.

## Health
GET /api/health

Independent of external providers and the database.

```json
{"status":"ok"}
```

GET /api/health/db

Separate connectivity check. Does not change the health contract above.

```json
{"database":"ok"}
```

`503` with `{"database":"unavailable"}` when PostgreSQL cannot be reached.

## Location search
GET /api/sites/search?q=<query>

`q` must be 3–200 characters. The backend calls Nominatim, throttles to one request per second, and caches normalized results. The response is an array:

```json
[{
  "displayName": "HSR Layout, Bengaluru, Karnataka, India",
  "latitude": 12.9116,
  "longitude": 77.6389,
  "address": {"city": "Bengaluru", "state": "Karnataka", "country": "India"},
  "source": "OpenStreetMap Nominatim",
  "attribution": "© OpenStreetMap contributors"
}]
```

## Reverse geocode
GET /api/sites/reverse?lat=<latitude>&lon=<longitude>

Same location object as search. Added so the map click flow does not call Nominatim from the browser (ADR-005).

## Analysis
POST /api/analysis

```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "buildingType": "residential",
  "plotAreaSqFt": 2400,
  "builtUpAreaSqFt": 1800,
  "floors": 2,
  "qualityGrade": "standard",
  "budget": 5000000,
  "projectName": "Optional",
  "locationName": "Optional display override"
}
```

`buildingType`: `residential | commercial | industrial | institutional`  
`qualityGrade`: `economy | standard | premium | luxury`

Response contains `id`, `createdAt`, site data, `overallSuitabilityScore` (`number | null`), `suitabilityCategory`, `scorePartial`, factor results, terrain, water/flood-risk indicator, accessibility, facilities, environment, orientation, preliminary cost, data confidence, risks/limitations, sources, and a deterministic synthesis. No language model is called.

Factor scores are 0–10 or `null`. Weights remain the documented values. If a factor is unavailable it is excluded and the remaining weights are renormalized. An overall 0–100 index is published only when at least three factors and 60% of documented weight are available. Otherwise `overallSuitabilityScore` is `null` and the category is `Insufficient Data`.

Measurements such as elevation, slope, water distance, road distance, AQI, and rainfall are `null` when the provider did not return them. Absence of a mapped feature inside a completed search radius is reported as a real negative observation, not as a guessed distance.

## Get analysis
GET /api/analysis/:id

Returns the stored structured analysis. `404` if it does not exist. Unknown ids are not replaced with sample sites.

## Compare
POST /api/compare

```json
{"analysisIdA":"...","analysisIdB":"..."}
```

Uses only stored analyses. Returns both records, factor-by-factor scores, a cost difference, and a summary that does not make a universal recommendation. `winnerSiteId` is omitted when indexes are missing or within 3 points. A factor with a null score is marked `Unavailable`.

## Report
POST /api/reports/:analysisId

```json
{"reportId":"...","downloadUrl":"/api/reports/<reportId>","generatedAt":"..."}
```

GET /api/reports/:reportId

Returns `application/pdf`. The document is labeled as a preliminary pre-planning report, not certification.

## Errors
```json
{"error":"Validation failed","details":[{"path":"latitude","message":"..."}]}
```

Provider failures become a safe `503` or an unavailable field. Internal stacks are not returned outside development.
