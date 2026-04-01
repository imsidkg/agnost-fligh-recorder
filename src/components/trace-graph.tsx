"use client";

import "reactflow/dist/style.css";
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from "reactflow";

type EventItem = {
  id: number;
  primitiveName: string;
  primitiveType: string;
  success: boolean;
  checkpoints: { id: number; name: string; timestampMs: number; metadataJson?: string }[];
};

export function TraceGraph({ events }: { events: EventItem[] }) {
  const laneMap = new Map<string, number>();
  let nextLane = 0;
  const nodes: Node[] = events.map((event, index) => {
    const branchMeta = event.checkpoints
      .map((cp) => {
        try {
          const parsed = cp.metadataJson ? (JSON.parse(cp.metadataJson) as Record<string, unknown>) : {};
          const branchId = parsed.branch_id ?? parsed.branch ?? parsed.path ?? null;
          return branchId ? String(branchId) : null;
        } catch {
          return null;
        }
      })
      .find(Boolean);
    const branchLabel = branchMeta ?? event.checkpoints.find((cp) => cp.name.toLowerCase().includes("branch"))?.name;
    const laneKey = branchLabel ?? "default";
    if (!laneMap.has(laneKey)) {
      laneMap.set(laneKey, nextLane % 4);
      nextLane += 1;
    }
    const lane = laneMap.get(laneKey) ?? 0;
    return {
      id: String(event.id),
      position: { x: lane * 260, y: index * 110 + lane * 8 },
      data: {
        label: `${event.primitiveName} (${event.primitiveType})`,
      },
      style: {
        color: "#e4e4e7",
        background: "#18181b",
        border: `1px solid ${event.success ? "#34d399" : "#fb7185"}`,
        borderRadius: 10,
        width: 220,
      },
    };
  });

  const edges: Edge[] = events.slice(1).map((event, idx) => ({
    id: `${events[idx].id}-${event.id}`,
    source: String(events[idx].id),
    target: String(event.id),
    markerEnd: { type: MarkerType.ArrowClosed, color: "#52525b" },
    style: { stroke: "#52525b" },
    animated: false,
  }));

  return (
    <div className="h-[360px] rounded-lg border border-zinc-800 bg-zinc-950">
      <ReactFlow fitView nodes={nodes} edges={edges}>
        <Background color="#27272a" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
