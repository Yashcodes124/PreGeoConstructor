# BuildWise AI — Architecture Decisions

## ADR-001 — Modular monolith
Accepted. Faster to build and maintain than microservices for this project.

## ADR-002 — No AI/ML model in MVP
Accepted. The MVP uses deterministic geospatial analysis, weighted decision analysis, rules, and calculations. No LLM/model dependency.

## ADR-003 — Node/TypeScript backend
Accepted. The team has stronger practical JavaScript/TypeScript experience and the MVP has no Python/ML requirement.

## ADR-004 — PostgreSQL + Prisma
Accepted. Persistent site/analysis data is required and PostGIS may provide useful spatial operations.

## ADR-005 — Backend-only provider access
Accepted. Centralizes validation, caching, rate limiting, normalization, errors, and provider policy compliance.

## ADR-006 — Preliminary estimates
Accepted. Cost is an estimate, not a professional quantity-survey quotation.

## ADR-007 — No authentication in initial MVP
Accepted. Basic analysis should work without an account; auth/history can be added later.

## ADR-008 — Digital Raitha as UX inspiration
Accepted. Use its product/UX ideas only; do not copy its ML stack, security configuration, or mock prediction behavior.

## ADR-009 — Unavailable factors are excluded, not imputed
Accepted. If a provider fails, that factor score is null. Remaining documented weights are renormalized only to show a partial index, and only when at least three factors and 60% of documented weight are available. Otherwise the overall index is withheld. This does not change the documented weights.

## ADR-010 — Elevation provider fallback
Accepted. Open-Elevation is tried first. Open-Meteo elevation is used only if Open-Elevation fails, and the successful source is attributed. If both fail, elevation and slope are unavailable. This is a real secondary provider, not fabricated elevation.
