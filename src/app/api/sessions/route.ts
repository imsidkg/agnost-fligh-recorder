import { listSessions } from "@/lib/flight-recorder/store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? undefined;
  const from = Number(url.searchParams.get("from") ?? 0) || undefined;
  const to = Number(url.searchParams.get("to") ?? 0) || undefined;
  const errorsOnly = url.searchParams.get("errorsOnly") === "true";
  const data = await listSessions({ query, from, to, errorsOnly });
  return NextResponse.json(data);
}
