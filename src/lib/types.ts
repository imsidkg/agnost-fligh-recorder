export type CapturedCheckpoint = {
  name: string;
  timestamp_ms: number;
  metadata?: Record<string, unknown>;
};

export type CapturedEvent = {
  session_id: string;
  interaction_id?: string;
  user_id?: string;
  primitive_name: string;
  primitive_type: "tool" | "resource" | "prompt" | string;
  args: unknown;
  result: unknown;
  checkpoints: CapturedCheckpoint[];
  metadata?: Record<string, unknown>;
  latency: number;
  success: boolean;
  captured_at?: number;
  agent_name?: string;
};
