"use client";

import { useState } from "react";
import { addPlantingLog, harvestPlantingLog } from "@/lib/plot-actions";

type LogEntry = {
  id: string;
  plantName: string;
  datePlanted: string;
  dateHarvested: string | null;
  notes: string | null;
  userName: string;
  userId: string;
};

export function PlantingLogSection({
  plotId,
  logs,
  isOwner,
  currentUserId,
}: {
  plotId: string;
  logs: LogEntry[];
  isOwner: boolean;
  currentUserId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("plotId", plotId);
    const result = await addPlantingLog(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      setShowForm(false);
      setPending(false);
    }
  }

  async function handleHarvest(logId: string) {
    const result = await harvestPlantingLog(logId);
    if (result.error) setError(result.error);
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Planting Log</h2>
        {isOwner && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            + Add plant
          </button>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="plantName" className="block text-sm font-medium">
                Plant name
              </label>
              <input
                id="plantName"
                name="plantName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
              />
            </div>
            <div>
              <label htmlFor="datePlanted" className="block text-sm font-medium">
                Date planted
              </label>
              <input
                id="datePlanted"
                name="datePlanted"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="rounded-md bg-zinc-50 px-4 py-8 text-center dark:bg-zinc-800/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No plants logged yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <th className="pb-2 pr-4 font-medium">Plant</th>
                <th className="pb-2 pr-4 font-medium">Planted</th>
                <th className="pb-2 pr-4 font-medium">Harvested</th>
                <th className="pb-2 pr-4 font-medium">Gardener</th>
                <th className="pb-2 font-medium">Notes</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-2.5 pr-4 font-medium">{log.plantName}</td>
                  <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-400">
                    {formatDate(log.datePlanted)}
                  </td>
                  <td className="py-2.5 pr-4">
                    {log.dateHarvested ? (
                      <span className="text-green-700 dark:text-green-400">
                        {formatDate(log.dateHarvested)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">
                        Growing
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-400">
                    {log.userName}
                  </td>
                  <td className="max-w-[200px] truncate py-2.5 text-zinc-500 dark:text-zinc-400">
                    {log.notes ?? "—"}
                  </td>
                  <td className="py-2.5">
                    {!log.dateHarvested && log.userId === currentUserId && (
                      <button
                        onClick={() => handleHarvest(log.id)}
                        className="text-xs font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Mark harvested
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
