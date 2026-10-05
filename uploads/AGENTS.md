# BuildWise AI — AI Coding Agent Rules

## Before coding
Read PROJECT_CONTEXT.md, ARCHITECTURE.md, ROADMAP.md, API_CONTRACT.md, DATABASE.md, DECISIONS.md, CURRENT_STATUS.md. Inspect the actual repository before assuming docs match code.

## Scope
Implement only the requested task. Do not build future phases without approval.

## Architecture
Use the modular monolith, React/TypeScript frontend, Node/Express/TypeScript backend, PostgreSQL/Prisma, and PostGIS where practical.

## AI/model restriction
Do not add OpenAI, Claude, Gemini, Ollama, local LLMs, ML models, or paid AI APIs unless the project owner explicitly changes ADR-002.

## Code quality
Strict TypeScript. Avoid `any`. Keep modules focused. Validate inputs. Handle errors explicitly.

## External APIs
Backend only. Normalize responses before analysis. Cache repeated requests. Respect provider limits/policies. Never fabricate missing data.

## Security
No secrets in source. Use environment variables. Validate bodies. Configure CORS and Helmet. Rate-limit expensive endpoints. Set timeouts. Sanitize errors.

## Database
Use Prisma migrations. Update DATABASE.md for meaningful schema changes. Do not store unnecessary raw provider data.

## UI
Major async operations need loading, success, error, and unavailable-data states. Clearly distinguish derived data, estimates, unavailable data, and limitations.

## Construction claims
Never present the system as structural certification, legal approval, exact flood prediction, exact soil bearing capacity, guaranteed cost, or professional engineering approval.

## Testing
Before completion, run relevant lint, typecheck, tests, and production build. Never claim a check passed unless it was actually run.

## Dependencies
Do not install a dependency without explaining why and checking whether an existing dependency can solve the task.

## Change discipline
Make the smallest reasonable change. Do not rewrite unrelated files. Update API_CONTRACT.md for API changes, DECISIONS.md for architectural decisions, and CURRENT_STATUS.md after tasks.

## Completion report
Every task must report:
1. implementation
2. files created/changed
3. commands/checks run
4. results
5. known issues
6. documentation updated
7. next task
