import { client } from "@/lib/db/client";
import { NextResponse } from "next/server";

function safeDbLabel(url: string | undefined) {
  if (!url) return "missing";
  try {
    const cleaned = url.replace(/^libsql:\/\//, "");
    const host = cleaned.split("/")[0];
    return host || "unknown";
  } catch {
    return "invalid";
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  const hasToken = Boolean(process.env.TURSO_AUTH_TOKEN);
  let count: number | null = null;
  let error: string | null = null;

  try {
    const result = await client.execute("select count(*) as c from sessions");
    const value = result.rows[0]?.c;
    count = typeof value === "number" ? value : Number(value ?? 0);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    dbHost: safeDbLabel(databaseUrl),
    hasToken,
    sessionsCount: count,
    error,
  });
}
