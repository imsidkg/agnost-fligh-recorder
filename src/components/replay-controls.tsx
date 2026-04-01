"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ReplayLog = {
  eventId: number;
  primitive: string;
  status: string;
  checkpoints: number;
  mode: string;
  checkpointName?: string;
};

export function ReplayControls({
  onReplay,
  onPause,
  onStepForward,
  speed,
  onSpeedChange,
  progress,
  onSeek,
  logs,
  isPlaying,
}: {
  onReplay: (mode: "mock" | "live") => void;
  onPause: () => void;
  onStepForward: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  progress: { current: number; total: number };
  onSeek: (next: number) => void;
  logs: ReplayLog[];
  isPlaying: boolean;
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
        <Button size="sm" variant="ghost" onClick={onPause}>
          <Pause size={14} className="mr-1" />
          {isPlaying ? "Pause" : "Paused"}
        </Button>
        <Button size="sm" variant="outline" onClick={onStepForward}>
          <SkipForward size={14} className="mr-1" />
          Step
        </Button>
      </div>
      <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-2">
        <input
          type="range"
          min={0}
          max={Math.max(progress.total, 0)}
          value={progress.current}
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        <div className="text-xs text-zinc-400">
          {progress.current}/{progress.total}
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="text-zinc-400">speed</span>
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.5}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
        <span className="text-zinc-300">{speed.toFixed(1)}x</span>
      </div>
      <div className="max-h-44 overflow-auto text-xs text-zinc-300">
        {logs.map((log) => (
          <div key={log.eventId} className="border-b border-zinc-800 py-1">
            {log.primitive} | {log.status} | checkpoints: {log.checkpoints} | {log.mode}
            {log.checkpointName ? ` | ${log.checkpointName}` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
