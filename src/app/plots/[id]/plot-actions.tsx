"use client";

import { useState } from "react";
import { requestPlot, releasePlot } from "@/lib/plot-actions";

export function PlotActions({
  plotId,
  plotStatus,
  isOwner,
  isStaff,
}: {
  plotId: string;
  plotStatus: string;
  isOwner: boolean;
  isStaff: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: (id: string) => Promise<{ error?: string }>) {
    setPending(true);
    setError(null);
    const result = await action(plotId);
    if (result.error) {
      setError(result.error);
      setPending(false);
    }
  }

  const canRequest = plotStatus === "AVAILABLE";
  const canRelease = (isOwner || isStaff) && (plotStatus === "RESERVED" || plotStatus === "ACTIVE");

  if (!canRequest && !canRelease) return null;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 font-semibold">Actions</h2>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {canRequest && (
          <button
            onClick={() => handleAction(requestPlot)}
            disabled={pending}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {pending ? "Requesting..." : "Request This Plot"}
          </button>
        )}

        {canRelease && (
          <button
            onClick={() => handleAction(releasePlot)}
            disabled={pending}
            className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {pending ? "Releasing..." : "Release Plot"}
          </button>
        )}
      </div>
    </section>
  );
}
