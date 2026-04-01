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

  const steps = data.events.map((event) => ({
    eventId: event.id,
    primitive: event.primitiveName,
    primitiveType: event.primitiveType,
    status: event.success ? "ok" : "error",
    checkpoints: event.checkpoints.map((checkpoint) => ({
      name: checkpoint.name,
      timestampMs: checkpoint.timestampMs,
      metadata: JSON.parse(checkpoint.metadataJson),
    })),
    replayResult:
      mode === "mock"
        ? JSON.parse(event.resultJson)
        : { note: "live mode enabled: bind real tool handlers here" },
  }));

  return NextResponse.json({ mode, steps });
}
