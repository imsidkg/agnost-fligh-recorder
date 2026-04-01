"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-950 p-6 text-zinc-100">
      <div className="max-w-lg rounded-lg border border-rose-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
        <p className="mb-3 text-sm text-zinc-300">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
