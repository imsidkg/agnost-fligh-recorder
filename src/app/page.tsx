"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Play } from "lucide-react";
import { ReplayControls, type ReplayLog } from "@/components/replay-controls";
import { Timeline } from "@/components/timeline";
import { TraceGraph } from "@/components/trace-graph";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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

type ReplayStep = {
  eventId: number;
  primitive: string;
  primitiveType: string;
  status: string;
  checkpoints: { name: string; timestampMs: number; metadata: unknown }[];
};

export default function Home() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [logs, setLogs] = useState<ReplayLog[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayMode, setReplayMode] = useState<"mock" | "live">("mock");
  const [steps, setSteps] = useState<ReplayStep[]>([]);
  const [cursor, setCursor] = useState(0);
  const [query, setQuery] = useState("");
  const [agent, setAgent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<number | null>(null);

  const loadSessions = useCallback(async () => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (agent) params.set("agent", agent);
    if (fromDate) params.set("from", String(new Date(fromDate).getTime()));
    if (toDate) params.set("to", String(new Date(toDate).getTime()));
    if (errorsOnly) params.set("errorsOnly", "true");
    const url = `/api/sessions${params.toString() ? `?${params.toString()}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        if (!selected && data[0]?.sessionId) setSelected(data[0].sessionId);
      });
  }, [agent, errorsOnly, fromDate, query, selected, toDate]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/sessions/${selected}`)
      .then((r) => r.json())
      .then((data) => setDetails(data));
  }, [selected]);

  const flattened = useMemo(
    () =>
      steps.flatMap((step) =>
        (step.checkpoints.length > 0 ? step.checkpoints : [{ name: "complete", timestampMs: 0, metadata: {} }]).map(
          (checkpoint) => ({
            eventId: step.eventId,
            primitive: step.primitive,
            status: step.status,
            checkpoints: step.checkpoints.length,
            mode: replayMode,
            checkpointName: checkpoint.name,
          }),
        ),
      ),
    [steps, replayMode],
  );

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function replay(mode: "mock" | "live") {
    if (!selected) return;
    clearTimer();
    setReplayMode(mode);
    setCursor(0);
    setLogs([]);
    const response = await fetch(`/api/replay/${selected}`, {
      method: "POST",
      body: JSON.stringify({ mode }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    const replaySteps = (data.steps ?? []) as ReplayStep[];
    setSteps(replaySteps);
    setIsPlaying(true);
  }

  function stepForward() {
    setCursor((current) => {
      if (current >= flattened.length) return current;
      const next = current + 1;
      setLogs(flattened.slice(0, next));
      return next;
    });
  }

  function seek(next: number) {
    const bounded = Math.max(0, Math.min(next, flattened.length));
    setCursor(bounded);
    setLogs(flattened.slice(0, bounded));
  }

  function pauseReplay() {
    setIsPlaying(false);
    clearTimer();
  }

  useEffect(() => {
    clearTimer();
    if (!isPlaying || flattened.length === 0) return;
    timerRef.current = window.setInterval(() => {
      setCursor((current) => {
        if (current >= flattened.length) {
          setIsPlaying(false);
          clearTimer();
          return current;
        }
        const next = current + 1;
        setLogs(flattened.slice(0, next));
        return next;
      });
    }, Math.max(80, Math.round(400 / speed)));
    return clearTimer;
  }, [isPlaying, flattened, speed]);

  useEffect(() => clearTimer, []);

  return (
    <div className="grid min-h-screen grid-cols-[300px_1fr] bg-zinc-950 text-zinc-100">
      <aside className="border-r border-zinc-800 p-4">
        <h1 className="mb-3 text-lg font-semibold">Agnost Flight Recorder</h1>
        <Card className="mb-3 space-y-2 p-2 text-xs">
          <Input
            placeholder="session or agent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Input
            placeholder="agent name exact"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2">
            <Switch checked={errorsOnly} onCheckedChange={setErrorsOnly} />
            errors only
          </label>
          <Button size="sm" className="w-full" onClick={() => void loadSessions()}>
            Apply Filters
          </Button>
        </Card>
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
            href={selected ? `/api/export/${selected}?format=bundle` : "#"}
          >
            <Download size={14} className="mr-1" />
            Export as Test
          </a>
          <div className="ml-auto text-xs text-zinc-400">
            replay progress: {cursor}/{flattened.length}
          </div>
        </div>
        <ReplayControls
          onReplay={replay}
          onPause={pauseReplay}
          onStepForward={stepForward}
          speed={speed}
          onSpeedChange={setSpeed}
          progress={{ current: cursor, total: flattened.length }}
          onSeek={seek}
          logs={logs}
          isPlaying={isPlaying}
        />
        <div className="mt-4">
          {details ? <TraceGraph events={details.events} /> : null}
        </div>
        <div className="mt-4">
          {details ? <Timeline events={details.events} /> : <div className="text-zinc-400">No session selected</div>}
        </div>
      </main>
    </div>
  );
}
