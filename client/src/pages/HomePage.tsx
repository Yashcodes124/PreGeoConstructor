import { StatusBadge } from "../components/ui/StatusBadge";

export function HomePage() {
  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="page-title">
        <StatusBadge label="Phase 0 foundation" />
        <h1 id="page-title">BuildWise AI</h1>
        <p>
          Deterministic construction pre-planning tools for site analysis,
          suitability, orientation, cost estimates, and report generation.
        </p>
      </section>
    </main>
  );
}
