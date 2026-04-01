import { getSessionWithEvents } from "@/lib/flight-recorder/store";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const { mode = "mock" } = (await request.json()) as { mode?: "mock" | "live" };
  const data = await getSessionWithEvents(sessionId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = data.events.map((event) => ({
    eventId: event.id,
    primitive: event.primitiveName,
    status: event.success ? "ok" : "error",
    checkpoints: event.checkpoints.length,
    mode,
    replayResult:
      mode === "mock" ? JSON.parse(event.resultJson) : { note: "live mode hook goes here" },
  }));

  return NextResponse.json({ mode, logs });
}
