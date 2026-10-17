"use client";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="shell"><section className="notice error" role="alert">
    <h1>Algo salió mal</h1><p>No pudimos mostrar la mesa de ayuda.</p>
    <button onClick={() => reset()}>Intentar de nuevo</button>
  </section></main>;
}