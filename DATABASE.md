# BuildWise AI — Database

PostgreSQL via Prisma. Use PostGIS where practical when spatial queries are introduced. The baseline schema stores latitude and longitude as numeric fields. PostGIS is not enabled yet because no spatial SQL query has been introduced.

## Prisma baseline

Prisma files:
- `prisma/schema.prisma`
- `prisma.config.ts`
- `prisma/migrations/20260922000000_init/migration.sql`
- `prisma/migrations/migration_lock.toml`

Prisma dependencies:
- Root dev dependency: `prisma`
- Root runtime dependency: `@prisma/client`, required so the generated client at the repository root can resolve its runtime
- Server dependencies: `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`
- `pnpm-workspace.yaml` allows Prisma and esbuild build scripts

Environment variables:
- `DATABASE_URL` for runtime database access.
- `DIRECT_URL` for migration/direct database access when it differs from `DATABASE_URL`. Prisma CLI uses `DIRECT_URL` when set, otherwise `DATABASE_URL`.

Generated Prisma Client output is `generated/prisma` and is gitignored. Run `corepack pnpm db:generate` after schema changes.

`20260922000000_init` was applied to the local PostgreSQL 17 database `buildwise` during backend implementation. A fresh environment must run `corepack pnpm db:migrate` against its own database.

## Core tables

### Site
id, label, latitude, longitude, plotAreaSqFt, builtUpAreaSqFt, buildingType, floors, qualityGrade, budget, createdAt.

### Analysis
id, siteId, overallScore (nullable when an index is not published), dataConfidence, rawData JSONB (left null; raw provider payloads are not stored), normalizedData JSONB, createdAt.

### FactorResult
id, analysisId, factor, rawValue, score (nullable when unavailable), weight, explanation.

### OrientationResult
id, analysisId, recommendedAngle, solarScore, windScore, candidateScores JSONB.

### CostEstimate
id, analysisId, area, baseRate, terrainMultiplier, qualityMultiplier, estimatedCost, rangeLow, rangeHigh.

### Report
id, analysisId, generatedAt, path/url when persistent storage is used.

### ProviderCache
id, cacheKey (unique key), provider, payload JSONB (normalized, not raw provider dumps), expiresAt, createdAt. Expired rows are deleted on read.

Authentication/history tables are optional and should be added only when required.

## Suitability
score = slope×0.25 + water×0.20 + accessibility×0.20 + environment×0.15 + facilities×0.20

Factor scores are 0–10; convert weighted result to 0–100.

## Rules
Use Prisma migrations. Do not store secrets or unnecessary raw provider data. Cache records require expiry.
