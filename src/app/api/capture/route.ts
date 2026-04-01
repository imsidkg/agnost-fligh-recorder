import { persistCapturedEvent } from "@/lib/flight-recorder/store";
import type { CapturedEvent } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as CapturedEvent;
  await persistCapturedEvent(payload);
  return NextResponse.json({ ok: true });
}
