# Mesa de ayuda — Dominio 4: Incidencias de soporte técnico

Aplicación académica con Next.js App Router, TypeScript, Zod, TanStack Query y Server-Sent Events (SSE).

## Requisitos
- Node.js 20.9 o superior
- npm

## Ejecutar
```bash
npm install
npm run dev
```
Abre http://localhost:3000. Para producción local:
```bash
npm run build
npm run start
```

## Cómo cumple los requisitos
- **R1:** `src/lib/schema.ts` define el esquema Zod de cinco campos. `IncidenciaInput` sale de `z.infer<typeof incidenciaSchema>`. Se importa el mismo esquema en cliente y API.
- **R2:** `GET /api/incidencias` devuelve `{ data }`; `POST /api/incidencias` usa `safeParse`, responde 400 con `fields` por campo y 409 si el equipo ya tiene una incidencia abierta.
- **R3:** `src/app/page.tsx` es un Server Component `async` sin `use client`; `loading.tsx` y `error.tsx` propios.
- **R4:** `IncidenciasClient` usa `useQuery` con `queryKey: ["incidencias"]`, `useMutation` e invalida la consulta al terminar. Muestra carga, error, vacío y datos.
- **R5:** `/api/events` es un canal SSE; al crear una incidencia emite un evento que invalida la lista en las pestañas conectadas. El contador se actualiza por latido cada 3 segundos.
- **R6:** Metadata, descripción y Open Graph en `layout.tsx`; CSS adaptable y sin librerías de iconos pesadas.

## Regla 409: justificación
Un equipo/área no puede tener dos incidencias abiertas a la vez. El servidor revisa la lista completa porque el navegador puede tener datos desactualizados o modificados desde otra pestaña. Si ya existe una, devuelve HTTP 409 `OPEN_INCIDENT_EXISTS`.

## Prueba manual rápida
1. Abre la app en dos pestañas.
2. En la primera, registra una incidencia para un equipo nuevo, por ejemplo `Laboratorio`.
3. Verifica que aparezca automáticamente en la segunda y que el contador de conexiones cambie.
4. Intenta registrar otra incidencia para `Laboratorio`: debe responder 409.
5. Prueba prioridad `0`, `6`, o descripción corta: el formulario marca errores y la API rechaza datos inválidos con 400.

## Límites importantes para explicar
- **Persistencia:** los datos están en memoria; se reinician al reiniciar el servidor. Para producción se sustituiría `store.ts` por una base de datos.
- **SSE:** esta demo usa memoria compartida del proceso, así que funciona con un único proceso/instancia. En despliegues con varias instancias se usaría Redis Pub/Sub u otro bus compartido.
- **Lighthouse:** no se puede prometer una puntuación exacta sin ejecutar Lighthouse en el entorno final. Mídelo sobre `npm run build` seguido de `npm run start`, nunca sobre `next dev`. En Chrome DevTools > Lighthouse, selecciona las cuatro categorías y genera el informe. Ajusta lo que el informe señale.
- **Regla 409 y concurrencia:** para una entrega real, la comprobación y la inserción deben ser atómicas en la base de datos para evitar dos POST simultáneos.
- **GA4/Stripe:** no se implementaron porque son puntos extra opcionales y requieren configuración propia (ID de medición y claves de Stripe en modo test).
