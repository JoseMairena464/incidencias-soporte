import { IncidenciasClient } from "./ui/incidencias-client";

export const dynamic = "force-dynamic";
export default async function Page() {
  return <main className="shell">
    <header className="hero">
      <div className="eyebrow">DOMINIO 4 · SOPORTE TÉCNICO</div>
      <h1>Mesa de ayuda</h1>
      <p>Registra, prioriza y consulta las incidencias del equipo.</p>
    </header>
    <IncidenciasClient />
    <footer>Proyecto académico · Los registros de esta demo viven en memoria del servidor.</footer>
  </main>;
}