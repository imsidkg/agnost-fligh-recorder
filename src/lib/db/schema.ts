import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull().unique(),
  userId: text("user_id"),
  agentName: text("agent_name"),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  interactionId: text("interaction_id"),
  primitiveName: text("primitive_name").notNull(),
  primitiveType: text("primitive_type").notNull(),
  argsJson: text("args_json").notNull(),
  resultJson: text("result_json").notNull(),
  success: integer("success", { mode: "boolean" }).notNull(),
  latencyMs: integer("latency_ms").notNull(),
  metadataJson: text("metadata_json").notNull(),
  capturedAt: integer("captured_at", { mode: "timestamp_ms" }).notNull(),
});

export const checkpoints = sqliteTable("checkpoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  timestampMs: integer("timestamp_ms").notNull(),
  metadataJson: text("metadata_json").notNull(),
});

export type SessionRow = typeof sessions.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type CheckpointRow = typeof checkpoints.$inferSelect;
