import { countSubscribers, subscribe } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval>;
  let unsubscribe = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try { controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); } catch {}
      };
      unsubscribe = subscribe(data => send("incidencia", data));
      send("conectados", { count: countSubscribers() });
      heartbeat = setInterval(() => send("conectados", { count: countSubscribers() }), 3000);
    },
    cancel() { clearInterval(heartbeat); unsubscribe(); }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}