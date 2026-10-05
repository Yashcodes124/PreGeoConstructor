# BuildWise AI — Architecture

## Style
Modular monolith. No microservices for MVP.

## Stack
Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Leaflet/react-leaflet, Lucide React, Recharts, limited Framer Motion.

Backend: Node.js, Express, TypeScript, Zod, Prisma, Helmet, CORS, rate limiting.

Database: PostgreSQL + PostGIS where practical.

Data: OpenStreetMap ecosystem, Nominatim, Overpass/OpenStreetMap data, Open-Meteo, an elevation provider such as Open-Elevation, SunCalc.

Reports: PDFKit or equivalent Node PDF library.

Testing: Vitest/Jest, Supertest, optional Playwright.

## Flow
React → REST API → Express → validation → provider services → deterministic analysis → Prisma → PostgreSQL/PostGIS.

External providers are accessed by backend provider services only.

## Backend modules
server/src/
- app.ts
- server.ts
- config/
- routes/
- controllers/
- services/{geocoding,osm,elevation,weather,solar,suitability,orientation,cost,report}/
- algorithms/{slope,accessibility,waterIndicator,facilities,environment,suitability,orientation,cost}.ts
- schemas/
- middleware/
- utils/

## Frontend modules
client/src/
- app/
- pages/{HomePage,SiteSelectionPage,AnalysisPage,ComparePage,ReportPage}
- features/{map,site,suitability,environment,orientation,cost,report,compare}
- components/{ui,layout,map,charts}
- services/
- types/
- utils/

## Analysis request flow
POST /api/analysis
1. validate
2. normalize coordinates
3. check cache
4. fetch external data
5. normalize data
6. calculate indicators
7. calculate suitability
8. calculate orientation
9. calculate preliminary cost
10. calculate data confidence
11. persist
12. return structured result

The analysis engine must not know which provider supplied the data.

## Security
Validate inputs, keep secrets server-side, rate-limit expensive endpoints, use timeouts, sanitize errors, restrict CORS, and respect provider policies/attribution.
