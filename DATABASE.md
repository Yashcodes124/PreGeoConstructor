# BuildWise AI — Database

PostgreSQL via Prisma. Use PostGIS where practical when spatial queries are introduced.

## Prisma baseline

Prisma files:
- `prisma/schema.prisma`
- `prisma.config.ts`
- `prisma/migrations/20260922000000_init/migration.sql`

Prisma dependencies:
- Root dev dependency: `prisma`
- Server dependencies: `@prisma/client`, `@prisma/adapter-pg`, `pg`
- `pnpm-workspace.yaml` explicitly allows Prisma build scripts required by the CLI/engines install.

Environment variables:
- `DATABASE_URL` for runtime database access.
- `DIRECT_URL` for migration/direct database access when it differs from `DATABASE_URL`.

Generated Prisma Client output is configured for `generated/prisma` and is intentionally ignored by Git. Run `corepack pnpm db:generate` after schema changes.

Migration status/application checks require a reachable PostgreSQL database at the configured `DATABASE_URL`/`DIRECT_URL`.

## Core tables

### Site
id, label, latitude, longitude, plotAreaSqFt, builtUpAreaSqFt, buildingType, floors, qualityGrade, budget, createdAt.

### Analysis
id, siteId, overallScore, dataConfidence, rawData JSONB, normalizedData JSONB, createdAt.

### FactorResult
id, analysisId, factor, rawValue, score, weight, explanation.

### OrientationResult
id, analysisId, recommendedAngle, solarScore, windScore, candidateScores JSONB.

### CostEstimate
id, analysisId, area, baseRate, terrainMultiplier, qualityMultiplier, estimatedCost, rangeLow, rangeHigh.

### Report
id, analysisId, generatedAt, path/url when persistent storage is used.

### ProviderCache
id/key, provider, payload JSONB, expiresAt.

Authentication/history tables are optional and should be added only when required.

## Suitability
score = slope×0.25 + water×0.20 + accessibility×0.20 + environment×0.15 + facilities×0.20

Factor scores are 0–10; convert weighted result to 0–100.

## Rules
Use Prisma migrations. Do not store secrets or unnecessary raw provider data. Cache records require expiry.
