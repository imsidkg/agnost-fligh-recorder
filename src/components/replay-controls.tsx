"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReplayLog = {
  eventId: number;
  primitive: string;
  status: string;
  checkpoints: number;
  mode: string;
};

export function ReplayControls({
  onReplay,
  logs,
}: {
  onReplay: (mode: "mock" | "live") => void;
  logs: ReplayLog[];
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Button size="sm" onClick={() => onReplay("mock")}>
          <Play size={14} className="mr-1" />
          Replay Mock
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReplay("live")}>
          <SkipForward size={14} className="mr-1" />
          Replay Live
        </Button>
        <Button size="sm" variant="ghost">
          <Pause size={14} className="mr-1" />
          Pause
        </Button>
      </div>
      <div className="max-h-44 overflow-auto text-xs text-zinc-300">
        {logs.map((log) => (
          <div key={log.eventId} className="border-b border-zinc-800 py-1">
            {log.primitive} | {log.status} | checkpoints: {log.checkpoints} | {log.mode}
          </div>
        ))}
      </div>
    </div>
  );
}
