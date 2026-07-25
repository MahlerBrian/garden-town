"use client";

import { useState } from "react";
import { requestPlot } from "@/lib/plot-actions";

export function RequestPlotButton({ plotId }: { plotId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    setPending(true);
    setError(null);
    const result = await requestPlot(plotId);
    if (result.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={pending}
        className="flex-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? "Requesting..." : "Request"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
