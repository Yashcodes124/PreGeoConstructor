# BuildWise AI — Current Status

## Current Phase
Phase 0 — Project Foundation / Database Baseline

## Completed
- BuildWise proposal reviewed
- Digital Raitha reviewed as reference
- MVP scope defined
- no-AI-model constraint confirmed
- architecture direction selected
- project-control documentation created
- Initial pnpm workspace configuration created
- React/Vite/TypeScript frontend foundation created
- Express/TypeScript backend foundation created
- Strict shared TypeScript configuration created
- Root linting configuration created
- Environment example files created without secrets
- Basic Git hygiene files created
- `GET /api/health` endpoint implemented
- Backend health endpoint test added
- Prisma configuration added
- PostgreSQL Prisma schema baseline added for documented core tables
- Initial Prisma migration SQL added
- Database environment examples added without secrets
- Prisma validation/generation scripts added
- Prisma/PostgreSQL dependencies installed and lockfile synced
- Prisma Client generated to ignored `generated/prisma`
- Initial Prisma migration SQL sanity-checked against the schema with Prisma CLI output

## Not Started
Database connection from API routes, PostGIS-specific spatial fields/queries, map, external providers, analysis engine, orientation behavior, cost behavior, PDF, comparison, deployment.

## Source of Truth
Read before coding:
1. AGENTS.md
2. PROJECT_CONTEXT.md
3. ARCHITECTURE.md
4. ROADMAP.md
5. API_CONTRACT.md
6. DATABASE.md
7. DECISIONS.md
8. CURRENT_STATUS.md

## Next Task
Begin Phase 1 product shell only after approval.

## Verification
- `corepack pnpm install --config.confirmModulesPurge=false` completed successfully with the lockfile passing the active supply-chain policy.
- `corepack pnpm list prisma @prisma/client @prisma/adapter-pg pg --depth 0 -r` confirmed `prisma@7.9.1`, `@prisma/client@7.9.1`, `@prisma/adapter-pg@7.9.1`, and `pg@8.23.0`.
- `corepack pnpm run db:validate` passed.
- `corepack pnpm run db:generate` passed and generated Prisma Client to `generated/prisma`.
- `corepack pnpm exec prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` passed and rendered baseline SQL for the schema.
- `corepack pnpm exec prisma migrate status` was attempted but could not reach PostgreSQL at `localhost:5432` in this environment.
- `corepack pnpm run lint` passed.
- `corepack pnpm run typecheck` passed.
- `corepack pnpm run test` passed with 1 backend health test.
- `corepack pnpm run build` passed for client and server.

## Known Issues
- The local `npm` shim is broken in this environment, so project commands were run with Corepack/pnpm.
- The registry reports ESLint 9 as deprecated in this environment; it is retained because the current TypeScript ESLint stack installed cleanly and lint passes.
- Local PostgreSQL is not running/reachable at `localhost:5432`, so migration status/application could not be verified against a live database here.
- Git status is not usable in this sandbox: with the injected safe-directory override it fails with `fatal: cannot change to 'C:/Users/ayash'`, and without that override it reports dubious ownership for `C:/Users/ayash`; file changes were inspected directly instead.

## Update rule
After every meaningful implementation task record completed work, current work, known issues, verification results, and next task.
