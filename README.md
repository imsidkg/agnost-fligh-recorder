# Agnost Flight Recorder

Local-first MCP replay debugger built on Agnost AI.

## Stack
- Next.js App Router + TypeScript
- Tailwind + Radix-style UI primitives
- Drizzle ORM + SQLite/libsql
- Monaco JSON viewers
- Lucide icons

## Quick Start
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Desktop mode (optional, Tauri)
```bash
npm run desktop:dev
```
Build desktop app:
```bash
npm run desktop:build
```

## Environment
Create `.env.local`:
```bash
DATABASE_URL=file:./flight-recorder.db # local dev
AGNOST_ORG_ID=5b052a8c-e1c0-4095-a303-949539a2ff3c
```

For Vercel + Turso, use:
```bash
DATABASE_URL=libsql://agnosti-ai-siddharth8271skg2.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
AGNOST_ORG_ID=5b052a8c-e1c0-4095-a303-949539a2ff3c
```

## One-command setup wrapper
```bash
npx create-flight-recorder my-recorder
```
Local repo usage:
```bash
node create-flight-recorder/index.js my-recorder
```

## Wrapping an existing MCP server
```ts
import { setupFlightRecorder } from "@/lib/flight-recorder/track-mcp";

const recorder = setupFlightRecorder(mcpServer, process.env.AGNOST_ORG_ID!);

await recorder.withCapture({
  session_id: "sess_123",
  user_id: "user_123",
  primitive_name: "search_docs",
  primitive_type: "tool",
  args: { query: "latency tuning" },
  run: () => realToolHandler({ query: "latency tuning" }),
});
```

## API Endpoints
- `POST /api/capture`
- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/replay/:sessionId`
- `GET /api/export/:sessionId?format=json|pytest|ts|bundle`

## Filtering
Session list supports query params:
- `query` (session id or agent contains)
- `agent` (exact agent match)
- `from` and `to` (epoch ms)
- `errorsOnly=true`

## Export bundle
`format=bundle` returns a JSON object with generated files:
- `session.json`
- `recorded_session.py`
- `recorded_session.spec.ts`

## Screenshot placeholders
- `docs/screenshots/dashboard.png`
- `docs/screenshots/timeline-expanded.png`
- `docs/screenshots/replay-logs.png`

## Replay controls
- play/pause/step-forward
- seek bar for timeline position
- replay speed control (0.5x to 4x)

## E2E smoke tests
```bash
npm run test:e2e
```
Current smoke suite focuses on API-level checks so it runs in CI without browser binaries.

Run smoke tests against deployed app:
```bash
npm run test:e2e:prod
```

## Wrapper packaging (npx-ready)
Pack local scaffold CLI tarball:
```bash
npm run wrapper:pack
```
