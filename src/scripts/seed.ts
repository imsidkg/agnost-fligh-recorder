import { db } from "../lib/db/client";
import { checkpoints, events, sessions } from "../lib/db/schema";

async function seed() {
  const now = Date.now();
  const sessionId = `seed_${now}`;

  await db.insert(sessions).values({
    sessionId,
    userId: "seed-user",
    agentName: "seed-agent",
    startedAt: new Date(now - 5000),
  });

  const inserted = await db
    .insert(events)
    .values([
      {
        sessionId,
        interactionId: `int_${now}_1`,
        primitiveName: "search_docs",
        primitiveType: "tool",
        argsJson: JSON.stringify({ query: "latency optimization" }),
        resultJson: JSON.stringify({ hits: 4, top: "Use batching" }),
        success: true,
        latencyMs: 120,
        metadataJson: JSON.stringify({ branch_id: "main" }),
        capturedAt: new Date(now - 4500),
      },
      {
        sessionId,
        interactionId: `int_${now}_2`,
        primitiveName: "generate_answer",
        primitiveType: "prompt",
        argsJson: JSON.stringify({ question: "How do I optimize?" }),
        resultJson: JSON.stringify({ answer: "Use caching and parallel I/O." }),
        success: true,
        latencyMs: 210,
        metadataJson: JSON.stringify({ branch_id: "main" }),
        capturedAt: new Date(now - 3500),
      },
    ])
    .returning({ id: events.id });

  await db.insert(checkpoints).values([
    {
      eventId: inserted[0].id,
      name: "branch:main:start",
      timestampMs: now - 4450,
      metadataJson: JSON.stringify({ branch_id: "main", stage: "start" }),
    },
    {
      eventId: inserted[0].id,
      name: "branch:main:end",
      timestampMs: now - 4380,
      metadataJson: JSON.stringify({ branch_id: "main", stage: "end" }),
    },
    {
      eventId: inserted[1].id,
      name: "branch:main:start",
      timestampMs: now - 3400,
      metadataJson: JSON.stringify({ branch_id: "main", stage: "start" }),
    },
  ]);

  console.log(`Seeded demo session: ${sessionId}`);
}

void seed();
