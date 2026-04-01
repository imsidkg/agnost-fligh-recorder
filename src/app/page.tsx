"use client";

import { useEffect, useState } from "react";
import { Download, Play } from "lucide-react";
import { ReplayControls } from "@/components/replay-controls";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";

type SessionSummary = {
  sessionId: string;
  agentName: string | null;
  startedAt: string;
  eventCount: number;
  errorCount: number;
};

type SessionDetails = {
  events: {
    id: number;
    primitiveName: string;
    primitiveType: string;
    argsJson: string;
    resultJson: string;
    success: boolean;
    latencyMs: number;
    capturedAt: string;
    checkpoints: { id: number; name: string; timestampMs: number; metadataJson: string }[];
  }[];
};

export default function Home() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [logs, setLogs] = useState<
    { eventId: number; primitive: string; status: string; checkpoints: number; mode: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        if (data[0]?.sessionId) setSelected(data[0].sessionId);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/sessions/${selected}`)
      .then((r) => r.json())
      .then((data) => setDetails(data));
  }, [selected]);

  async function replay(mode: "mock" | "live") {
    if (!selected) return;
    const response = await fetch(`/api/replay/${selected}`, {
      method: "POST",
      body: JSON.stringify({ mode }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setLogs(data.logs ?? []);
  }

  return (
    <div className="grid min-h-screen grid-cols-[300px_1fr] bg-zinc-950 text-zinc-100">
      <aside className="border-r border-zinc-800 p-4">
        <h1 className="mb-3 text-lg font-semibold">Agnost Flight Recorder</h1>
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.sessionId}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-left text-xs hover:border-zinc-700"
              onClick={() => setSelected(session.sessionId)}
            >
              <div className="truncate font-medium">{session.sessionId}</div>
              <div className="text-zinc-400">{session.agentName ?? "unknown-agent"}</div>
              <div className="text-zinc-500">
                events: {session.eventCount} errors: {session.errorCount}
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={() => replay("mock")}>
            <Play size={14} className="mr-1" />
            Replay Session
          </Button>
          <a
            className="inline-flex h-9 items-center rounded-md border border-zinc-700 px-4 text-sm"
            href={selected ? `/api/export/${selected}?format=ts` : "#"}
          >
            <Download size={14} className="mr-1" />
            Export as Test
          </a>
        </div>
        <ReplayControls onReplay={replay} logs={logs} />
        <div className="mt-4">
          {details ? <Timeline events={details.events} /> : <div className="text-zinc-400">No session selected</div>}
        </div>
      </main>
    </div>
  );
}
