import { z } from "zod";

export const categorias = [
  "Hardware", "Software", "Red", "Acceso", "Impresora", "Otro"
] as const;
export const prioridades = ["Baja", "Media", "Alta", "Crítica"] as const;

export const incidenciaSchema = z.object({
  titulo: z.string().trim().min(5, "El título debe tener al menos 5 caracteres.").max(90, "Máximo 90 caracteres."),
  equipo: z.string().trim().min(2, "Indica el equipo o área.").max(50, "Máximo 50 caracteres."),
  categoria: z.enum(categorias, { errorMap: () => ({ message: "Selecciona una categoría válida." }) }),
  prioridad: z.number().int("La prioridad debe ser un entero.").min(1, "La prioridad mínima es 1.").max(5, "La prioridad máxima es 5."),
  descripcion: z.string().trim().min(10, "Describe el problema con al menos 10 caracteres.").max(500, "Máximo 500 caracteres.")
});
export type IncidenciaInput = z.infer<typeof incidenciaSchema>;

export type Incidencia = IncidenciaInput & {
  id: string;
  estado: "Abierta";
  creadaEn: string;
};