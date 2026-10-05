# BuildWise AI — Current Status

## Current Phase
Backend foundation through analysis, compare, PDF report, and frontend API integration. Phase 0 database baseline is in the repository and was applied locally.

## Backend audit (repository, not the previous status file)
The uploaded/previous status described a Prisma baseline that was not present when this session started. The physical tree had a completed React frontend and no `server/`, Prisma schema, migrations, or API process. That missing backend has now been implemented. The frontend pseudo-geospatial fallback was not copied into the backend.

## Completed
- Express/TypeScript modular monolith in `server/` with Helmet, CORS, body size limit, rate limits, Zod validation, centralized errors, and graceful shutdown.
- `GET /api/health` returns `{ "status": "ok" }` without providers or the database.
- `GET /api/health/db` is a separate connectivity check.
- Prisma 7 schema and migration `20260922000000_init` for Site, Analysis, FactorResult, OrientationResult, CostEstimate, Report, and ProviderCache.
- Local PostgreSQL 17 database `buildwise` accepted that migration in this environment.
- Nominatim search and reverse geocoding go through the backend, with a 1 request/second slot, timeout, cache, and attribution.
- Elevation uses Open-Elevation, then Open-Meteo elevation only if the first provider fails. Slope is computed from real samples.
- OpenStreetMap Overpass is queried in smaller water, road, and facility subsets. A failed subset stays unavailable.
- Climate, air quality, and wind come from Open-Meteo. Solar geometry is local SunCalc. No LLM or ML service is used.
- Deterministic suitability, orientation, preliminary cost, confidence, and synthesis are implemented. Missing measurements are null.
- `POST /api/analysis`, `GET /api/analysis/:id`, `POST /api/compare`, `POST /api/reports/:analysisId`, and `GET /api/reports/:reportId` are implemented.
- Frontend calls `/api` through the Vite proxy. Direct Nominatim calls and the latitude/longitude pseudo-geospatial fallback were removed. Compare no longer invents sample sites.

## Files changed
- Backend: `server/**`, `prisma/**`, `prisma.config.ts`, `.env.example`, `.gitignore`
- Workspace: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- Frontend integration: `client/src/services/api.ts`, `client/src/types/api.ts`, `client/vite.config.ts`, and the analysis/compare/report/map components that had to display nulls or stop fabricating results
- Docs: `API_CONTRACT.md`, `DATABASE.md`, `DECISIONS.md`, `CURRENT_STATUS.md`

## Verification
- `corepack pnpm --filter server typecheck` passed.
- `corepack pnpm --filter client typecheck` passed.
- `corepack pnpm --filter server test` passed: 17 tests.
- `corepack pnpm exec prisma validate`, `prisma generate`, and `prisma migrate deploy` passed against local PostgreSQL.
- Live `GET /api/health` returned `{"status":"ok"}`.
- Live `GET /api/health/db` returned `{"database":"ok"}`.
- Live Nominatim search for HSR Layout returned real OpenStreetMap results.
- Live `POST /api/analysis` for 12.9716, 77.5946 returned HTTP 201 in about 59s. Elevation 911.3 m and slope 2.6% came from Open-Elevation. Rainfall 1035 mm, AQI 104, and wind came from Open-Meteo. Water distance 118 m came from Overpass. Road and facility Overpass queries returned HTTP 504 and were stored as unavailable, not guessed.
- `GET /api/analysis/:id` returned that stored record.
- `POST /api/reports/:id` returned report metadata and `GET /api/reports/:reportId` returned a 2-page `application/pdf`.
- `POST /api/compare` on two stored ids returned a close-score summary and did not declare a winner.
- Vite proxy `GET http://127.0.0.1:5173/api/health` returned `{"status":"ok"}`.

## Known issues
- Public Overpass is unreliable under load. Road and facility queries can return HTTP 504. Those factors are then unavailable. Failed subsets are not cached, so a later analysis can retry them.
- The trial analysis `a4de6120-1a45-423b-938a-9ae895fab784` was saved before the confidence correction and still has `dataConfidence` 100. New analyses use the corrected rule and will not mark confidence High when roads or facilities are missing.
- PostGIS is not installed or used. The documented schema does not require geometry columns yet.
- PostgreSQL in this sandbox is local and will not persist as an installed service across environment resets. The migration SQL is in the repository.
- PDF reports include coordinates and location text, not an embedded map tile, to avoid tile-usage issues.
- No authentication, bylaw engine, or soil-bearing data. Those remain out of scope.
- `pnpm` 12 ignores `package.json` `pnpm.onlyBuiltDependencies`. Build-script approval is in `pnpm-workspace.yaml`.

## Next task
Retry OpenStreetMap road and facility collection against a healthier Overpass window, or add one additional public Overpass mirror that returns the same query rather than an empty result. Do not impute distances if that also fails.
