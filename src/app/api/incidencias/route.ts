import { NextResponse } from "next/server";
import { addIncidencia, getIncidencias, hasOpenIncidentForTeam } from "@/lib/store";
import { incidenciaSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ data: getIncidencias() }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "El cuerpo debe ser JSON válido.", fields: { _form: ["JSON inválido."] } }, { status: 400 }); }

  const parsed = incidenciaSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ message: "Revisa los campos del formulario.", fields }, { status: 400 });
  }

  // Regla de negocio: un equipo no puede tener dos incidencias abiertas a la vez.
  // Se comprueba en el servidor porque el navegador no conoce todos los registros actuales.
  if (hasOpenIncidentForTeam(parsed.data.equipo)) {
    return NextResponse.json({
      message: "Ese equipo ya tiene una incidencia abierta. Resuelve la anterior antes de registrar otra.",
      code: "OPEN_INCIDENT_EXISTS",
      fields: { equipo: ["Ya existe una incidencia abierta para este equipo."] }
    }, { status: 409 });
  }
  const item = addIncidencia(parsed.data);
  return NextResponse.json({ data: item }, { status: 201 });
}