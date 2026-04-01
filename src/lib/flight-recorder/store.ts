import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { client, db } from "@/lib/db/client";
import { checkpoints, events, sessions } from "@/lib/db/schema";
import type { CapturedEvent } from "@/lib/types";

const toJson = (value: unknown) => JSON.stringify(value ?? null);
let dbInitPromise: Promise<void> | null = null;

async function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await client.execute(`
        create table if not exists sessions (
          id integer primary key autoincrement,
          session_id text not null unique,
          user_id text,
          agent_name text,
          started_at integer not null,
          created_at integer not null default (unixepoch('now') * 1000)
        );
      `);
      await client.execute(`
        create table if not exists events (
          id integer primary key autoincrement,
          session_id text not null,
          interaction_id text,
          primitive_name text not null,
          primitive_type text not null,
          args_json text not null,
          result_json text not null,
          success integer not null,
          latency_ms integer not null,
          metadata_json text not null,
          captured_at integer not null
        );
      `);
      await client.execute(`
        create table if not exists checkpoints (
          id integer primary key autoincrement,
          event_id integer not null,
          name text not null,
          timestamp_ms integer not null,
          metadata_json text not null
        );
      `);
    })();
  }
  await dbInitPromise;
}

export async function persistCapturedEvent(payload: CapturedEvent) {
  await ensureDbInitialized();
  const now = Date.now();
  const capturedAt = new Date(payload.captured_at ?? now);

  await db
    .insert(sessions)
    .values({
      sessionId: payload.session_id,
      userId: payload.user_id ?? null,
      agentName: payload.agent_name ?? null,
      startedAt: capturedAt,
    })
    .onConflictDoNothing({ target: sessions.sessionId });

  const inserted = await db
    .insert(events)
    .values({
      sessionId: payload.session_id,
      interactionId: payload.interaction_id ?? null,
      primitiveName: payload.primitive_name,
      primitiveType: payload.primitive_type,
      argsJson: toJson(payload.args),
      resultJson: toJson(payload.result),
      success: payload.success,
      latencyMs: payload.latency,
      metadataJson: toJson(payload.metadata),
      capturedAt,
    })
    .returning({ id: events.id });

  const eventId = inserted[0]?.id;
  if (!eventId || payload.checkpoints.length === 0) return;

  await db.insert(checkpoints).values(
    payload.checkpoints.map((checkpoint) => ({
      eventId,
      name: checkpoint.name,
      timestampMs: checkpoint.timestamp_ms,
      metadataJson: toJson(checkpoint.metadata),
    })),
  );
}

export async function listSessions(filters?: {
  query?: string;
  agent?: string;
  from?: number;
  to?: number;
  errorsOnly?: boolean;
}) {
  await ensureDbInitialized();
  const where = [];
  if (filters?.query) {
    where.push(
      sql`${sessions.sessionId} like ${`%${filters.query}%`} or ${sessions.agentName} like ${`%${filters.query}%`}`,
    );
  }
  if (filters?.agent) {
    where.push(eq(sessions.agentName, filters.agent));
  }
  if (filters?.from) where.push(gte(sessions.startedAt, new Date(filters.from)));
  if (filters?.to) where.push(lte(sessions.startedAt, new Date(filters.to)));
  if (filters?.errorsOnly) {
    where.push(
      sql`exists (select 1 from ${events} where ${events.sessionId} = ${sessions.sessionId} and ${events.success} = 0)`,
    );
  }
  const predicate = where.length ? and(...where) : undefined;

  return db
    .select({
      sessionId: sessions.sessionId,
      userId: sessions.userId,
      agentName: sessions.agentName,
      startedAt: sessions.startedAt,
      eventCount: sql<number>`(
        select count(*) from ${events} e where e.session_id = ${sessions.sessionId}
      )`,
      errorCount: sql<number>`(
        select count(*) from ${events} e where e.session_id = ${sessions.sessionId} and e.success = 0
      )`,
    })
    .from(sessions)
    .where(predicate)
    .orderBy(desc(sessions.startedAt));
}

export async function getSessionWithEvents(sessionId: string) {
  await ensureDbInitialized();
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId))
    .limit(1);
  if (!session[0]) return null;

  const eventRows = await db
    .select()
    .from(events)
    .where(eq(events.sessionId, sessionId))
    .orderBy(events.capturedAt);

  const output = [];
  for (const event of eventRows) {
    const cps = await db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.eventId, event.id))
      .orderBy(checkpoints.timestampMs);
    output.push({ ...event, checkpoints: cps });
  }
  return { session: session[0], events: output };
}
