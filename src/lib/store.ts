import type { Incidencia, IncidenciaInput } from "./schema";

const globalStore = globalThis as typeof globalThis & {
  incidenciasStore?: Incidencia[];
  listenersStore?: Set<(event: unknown) => void>;
};
const initial: Incidencia[] = [
  {
    id: "demo-1", titulo: "Computadora no enciende", equipo: "Recepción",
    categoria: "Hardware", prioridad: 4, descripcion: "El equipo no enciende desde esta mañana.",
    estado: "Abierta", creadaEn: new Date().toISOString()
  }
];
export const getIncidencias = (): Incidencia[] => {
  globalStore.incidenciasStore ??= initial;
  return [...globalStore.incidenciasStore].sort((a,b) => b.creadaEn.localeCompare(a.creadaEn));
};
export function addIncidencia(input: IncidenciaInput): Incidencia {
  globalStore.incidenciasStore ??= initial;
  const item: Incidencia = { ...input, id: crypto.randomUUID(), estado: "Abierta", creadaEn: new Date().toISOString() };
  globalStore.incidenciasStore.push(item);
  publish({ type: "incidencia-creada", incidencia: item });
  return item;
}
export function hasOpenIncidentForTeam(equipo: string): boolean {
  return getIncidencias().some(i => i.equipo.toLocaleLowerCase() === equipo.trim().toLocaleLowerCase() && i.estado === "Abierta");
}
export function subscribe(listener: (event: unknown) => void) {
  globalStore.listenersStore ??= new Set();
  globalStore.listenersStore.add(listener);
  return () => globalStore.listenersStore?.delete(listener);
}
export function countSubscribers() { return globalStore.listenersStore?.size ?? 0; }
function publish(event: unknown) {
  globalStore.listenersStore?.forEach(listener => listener(event));
}