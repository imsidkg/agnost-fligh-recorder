import { persistCapturedEvent } from "@/lib/flight-recorder/store";
import type { CapturedCheckpoint, CapturedEvent } from "@/lib/types";
import agnost from "agnostai";

type MCPServer = {
  server: {
    setRequestHandler?: (
      schema: unknown,
      handler: (request: unknown) => Promise<unknown>,
    ) => void;
  };
};

export function setupFlightRecorder(server: MCPServer, orgId: string) {
  const sdk = agnost as unknown as { trackMCP?: (target: unknown, id: string) => void };
  sdk.trackMCP?.(server, orgId);

  return {
    async capture(payload: CapturedEvent) {
      await persistCapturedEvent(payload);
    },
    async withCapture<T>(params: {
      session_id: string;
      user_id?: string;
      primitive_name: string;
      primitive_type: string;
      args: unknown;
      metadata?: Record<string, unknown>;
      checkpoints?: CapturedCheckpoint[];
      agent_name?: string;
      run: () => Promise<T>;
    }) {
      const started = performance.now();
      const checkpoints = params.checkpoints ?? [];
      try {
        const result = await params.run();
        await persistCapturedEvent({
          session_id: params.session_id,
          user_id: params.user_id,
          primitive_name: params.primitive_name,
          primitive_type: params.primitive_type,
          args: params.args,
          result,
          checkpoints,
          metadata: params.metadata,
          latency: Math.round(performance.now() - started),
          success: true,
          captured_at: Date.now(),
          agent_name: params.agent_name,
        });
        return result;
      } catch (error) {
        await persistCapturedEvent({
          session_id: params.session_id,
          user_id: params.user_id,
          primitive_name: params.primitive_name,
          primitive_type: params.primitive_type,
          args: params.args,
          result: { error: error instanceof Error ? error.message : String(error) },
          checkpoints,
          metadata: params.metadata,
          latency: Math.round(performance.now() - started),
          success: false,
          captured_at: Date.now(),
          agent_name: params.agent_name,
        });
        throw error;
      }
    },
  };
}
