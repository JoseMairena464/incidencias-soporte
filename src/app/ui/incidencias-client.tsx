"use client";
import { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categorias, incidenciaSchema, type Incidencia, type IncidenciaInput } from "@/lib/schema";

type ApiError = { message: string; fields?: Record<string, string[] | undefined>; code?: string };
async function fetchIncidencias(): Promise<Incidencia[]> {
  const response = await fetch("/api/incidencias", { cache: "no-store" });
  if (!response.ok) throw new Error("No fue posible consultar las incidencias.");
  const json = await response.json();
  return json.data as Incidencia[];
}
export function IncidenciasClient() {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [equipo, setEquipo] = useState("");
  const [categoria, setCategoria] = useState<(typeof categorias)[number] | "">("");
  const [prioridad, setPrioridad] = useState("3");
  const [descripcion, setDescripcion] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [formMessage, setFormMessage] = useState("");
  const [connected, setConnected] = useState(0);
  const [sseStatus, setSseStatus] = useState("Conectando en tiempo real…");

  const query = useQuery({
    queryKey: ["incidencias"],
    queryFn: fetchIncidencias,
    refetchOnMount: "always"
  });
  const mutation = useMutation({
    mutationFn: async (input: IncidenciaInput) => {
      const response = await fetch("/api/incidencias", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input)
      });
      const json = await response.json();
      if (!response.ok) throw { message: json.message ?? "No se pudo guardar.", fields: json.fields } satisfies ApiError;
      return json.data as Incidencia;
    },
    onSuccess: async () => {
      setFormMessage("Incidencia registrada correctamente.");
      setTitulo(""); setEquipo(""); setCategoria(""); setPrioridad("3"); setDescripcion(""); setFieldErrors({});
      await queryClient.invalidateQueries({ queryKey: ["incidencias"] });
    },
    onError: (error: ApiError) => {
      setFormMessage(error.message || "No se pudo guardar.");
      setFieldErrors(error.fields ?? {});
    }
  });
  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["incidencias"] });
  }, [queryClient]);

  useEffect(() => {
    const source = new EventSource("/api/events");
    source.onopen = () => setSseStatus("Tiempo real conectado");
    source.onerror = () => setSseStatus("Reconectando tiempo real…");
    source.addEventListener("incidencia", refresh);
    source.addEventListener("conectados", (event) => {
      try { setConnected(JSON.parse((event as MessageEvent).data).count ?? 0); } catch {}
    });
    return () => { source.removeEventListener("incidencia", refresh); source.close(); };
  }, [refresh]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(""); setFieldErrors({});
    const parsed = incidenciaSchema.safeParse({
      titulo, equipo, categoria, prioridad: Number(prioridad), descripcion
    });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setFormMessage("Hay campos que debes corregir.");
      return;
    }
    mutation.mutate(parsed.data);
  }
  const items = query.data ?? [];
  return <div className="content-grid">
    <section className="panel form-panel">
      <div className="section-heading"><div><span className="eyebrow">NUEVO REGISTRO</span><h2>Reportar incidencia</h2></div><span className="round-icon" aria-hidden="true">＋</span></div>
      <form onSubmit={submit} noValidate>
        <label htmlFor="titulo">Título</label>
        <input id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={90} placeholder="Ej. No funciona el teclado" />
        <FieldError errors={fieldErrors.titulo} />
        <label htmlFor="equipo">Equipo o área</label>
        <input id="equipo" value={equipo} onChange={e => setEquipo(e.target.value)} maxLength={50} placeholder="Ej. Recepción" />
        <FieldError errors={fieldErrors.equipo} />
        <label htmlFor="categoria">Categoría</label>
        <select id="categoria" value={categoria} onChange={e => setCategoria(e.target.value as typeof categoria)}>
          <option value="">Selecciona una categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <FieldError errors={fieldErrors.categoria} />
        <label htmlFor="prioridad">Prioridad (1 a 5)</label>
        <div className="priority-row"><input id="prioridad" type="number" min="1" max="5" step="1" value={prioridad} onChange={e => setPrioridad(e.target.value)} /><span>1 = baja · 5 = urgente</span></div>
        <FieldError errors={fieldErrors.prioridad} />
        <label htmlFor="descripcion">Descripción del problema</label>
        <textarea id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4} maxLength={500} placeholder="¿Qué ocurre y desde cuándo?" />
        <FieldError errors={fieldErrors.descripcion} />
        {formMessage && <p className={mutation.isError || Object.keys(fieldErrors).length ? "form-message error-text" : "form-message success-text"} role="status">{formMessage}</p>}
        <button className="primary-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Guardando…" : "Registrar incidencia"}</button>
      </form>
      <p className="rule-note"><strong>Regla del sistema:</strong> un equipo no puede tener dos incidencias abiertas al mismo tiempo. El servidor comprueba esta regla y responde con error 409 si se incumple.</p>
    </section>

    <section className="panel list-panel">
      <div className="section-heading"><div><span className="eyebrow">SEGUIMIENTO</span><h2>Incidencias registradas</h2></div><span className="count">{items.length}</span></div>
      <div className="live-row"><span className={`live-dot ${sseStatus.includes("conectado") ? "" : "offline"}`} /><span>{sseStatus}</span><span className="connection-count">{connected} conectados</span></div>
      {query.isLoading ? <div className="state-box" role="status">Cargando incidencias…</div>
       : (query.isError || query.isRefetchError) ? <div className="state-box error-state" role="alert"><p>No se pudo cargar la lista.</p><button className="secondary-button" onClick={() => void query.refetch()}>Reintentar</button></div>
       : items.length === 0 ? <div className="state-box"><span className="empty-icon">✓</span><h3>Todo despejado</h3><p>Aún no hay incidencias. Registra la primera con el formulario.</p></div>
       : <div className="incident-list">{items.map(item => <article className="incident" key={item.id}>
          <div className="incident-top"><span className={`category category-${item.categoria.toLowerCase()}`}>{item.categoria}</span><span className={`priority priority-${item.prioridad}`}>Prioridad {item.prioridad}/5</span></div>
          <h3>{item.titulo}</h3><p className="incident-description">{item.descripcion}</p>
          <div className="incident-bottom"><span><span className="mini-icon">⌂</span>{item.equipo}</span><span className="status-pill">● {item.estado}</span></div>
          <time dateTime={item.creadaEn}>{new Date(item.creadaEn).toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })}</time>
        </article>)}</div>}
      <p className="list-footnote">La lista se actualiza automáticamente cuando otra pestaña registra una incidencia.</p>
    </section>
  </div>;
}
function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}