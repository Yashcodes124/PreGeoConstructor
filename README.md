# PreGeoConstructor

> **Preliminary Geotechnical & Construction Intelligence Platform**  
> PreGeoConstructor streamlines early-stage construction and geotechnical analysis, providing automated baseline checks, site data verification, and structural feasibility insights.

---

## ?? Important Disclaimer
**PreGeoConstructor is designed for preliminary planning, data aggregation, and exploratory analysis only.**  
It does **not** provide formal, legally binding structural engineering certifications or final stamp approvals. All output must be reviewed and validated by a licensed professional engineer (PE) prior to site activity or municipal permitting.

---

## ??? Tech Stack

* **Frontend:** React, Vite, TypeScript
* **Backend:** Node.js, Express, TypeScript
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Monorepo / Package Manager:** `pnpm` Workspaces

---

## ?? Repository Architecture

```text
+-- client/              # React frontend application
+-- server/              # Express backend server & REST API endpoints
+-- prisma/              # Schema definitions and database migrations
¦   +-- schema.prisma
+-- AGENTS.md            # Coding agent constraints and execution rules
+-- ARCHITECTURE.md      # System design and data flow specifications
+-- API_CONTRACT.md      # Frontend/Backend API contracts
+-- DATABASE.md          # Database schema and setup guides
+-- ROADMAP.md           # Implementation phases and project tracking
?? Project StatusCurrent Phase: Phase 0 — Complete (Database & Project Baseline Setup)Status:Workspace packages (client, server, prisma) configured.Backend health endpoint (GET /api/health) verified.Prisma schema and migrations initialized.Next Target: Phase 1 — Product Shell & Core UI Integration.?? Getting StartedPrerequisitesNode.js (v18+ recommended)pnpm (Corepack enabled)PostgreSQL database instance running locally or via DockerInstallationClone the repository:Bashgit clone [https://github.com/Yashcodes124/PreGeoConstructor.git](https://github.com/Yashcodes124/PreGeoConstructor.git)
cd PreGeoInteligeConstructor
Install dependencies:Bashcorepack pnpm install
Configure Environment Variables:Copy .env.example to create .env in the root and configure your PostgreSQL connection string:Bashcp .env.example .env
Generate Prisma Client & Run Migrations:Bashpnpm run db:generate
pnpm run db:validate
?? Development Scriptspnpm run build — Build all client and server packages.pnpm run test — Run the backend unit and integration test suites.pnpm run lint — Lint code across all workspace packages.pnpm run typecheck — Perform TypeScript static type checking.
