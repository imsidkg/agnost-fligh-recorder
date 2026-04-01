"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { JsonViewer } from "@/components/json-viewer";
import { cn } from "@/lib/utils";

type EventItem = {
  id: number;
  primitiveName: string;
  primitiveType: string;
  argsJson: string;
  resultJson: string;
  success: boolean;
  latencyMs: number;
  capturedAt: string;
  checkpoints: {
    id: number;
    name: string;
    timestampMs: number;
    metadataJson: string;
  }[];
};

export function Timeline({ events }: { events: EventItem[] }) {
  const [openId, setOpenId] = useState<number | null>(events[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {events.map((event, idx) => {
        const isOpen = openId === event.id;
        return (
          <div key={event.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60">
            <button
              className="flex w-full items-center gap-3 p-3 text-left"
              onClick={() => setOpenId(isOpen ? null : event.id)}
            >
              <div className="w-5">{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
              <div className={cn("h-2.5 w-2.5 rounded-full", event.success ? "bg-emerald-400" : "bg-rose-400")} />
              <div className="text-sm font-medium text-zinc-100">{event.primitiveName}</div>
              <div className="text-xs text-zinc-400">{event.primitiveType}</div>
              <div className="ml-auto text-xs text-zinc-500">{event.latencyMs}ms</div>
              <div className="text-xs text-zinc-500">#{idx + 1}</div>
            </button>
            {isOpen ? (
              <div className="grid gap-3 border-t border-zinc-800 p-3 lg:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs uppercase tracking-wider text-zinc-400">Args</h4>
                  <JsonViewer value={JSON.parse(event.argsJson)} />
                </div>
                <div>
                  <h4 className="mb-2 text-xs uppercase tracking-wider text-zinc-400">Result</h4>
                  <JsonViewer value={JSON.parse(event.resultJson)} />
                </div>
                <div className="lg:col-span-2">
                  <h4 className="mb-2 text-xs uppercase tracking-wider text-zinc-400">Checkpoints</h4>
                  <div className="space-y-2">
                    {event.checkpoints.map((checkpoint) => (
                      <div key={checkpoint.id} className="rounded-md border border-zinc-700 p-2 text-xs">
                        <div className="font-medium text-zinc-200">{checkpoint.name}</div>
                        <div className="text-zinc-400">{checkpoint.timestampMs}</div>
                        <div className="mt-2">
                          <JsonViewer value={JSON.parse(checkpoint.metadataJson)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
