"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlot } from "@/lib/admin-actions";

export function AdminCreatePlot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await createPlot(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      setPending(false);
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Add Plot
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 font-semibold">Add New Plot</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="label" className="block text-sm font-medium">
              Label
            </label>
            <input
              id="label"
              name="label"
              type="text"
              required
              placeholder="e.g. A-1"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
          </div>
          <div>
            <label htmlFor="size" className="block text-sm font-medium">
              Size
            </label>
            <input
              id="size"
              name="size"
              type="text"
              required
              placeholder="e.g. 4x8 ft"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              placeholder="e.g. North garden"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
          </div>
          <div>
            <label htmlFor="sunlight" className="block text-sm font-medium">
              Sunlight
            </label>
            <select
              id="sunlight"
              name="sunlight"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
            >
              <option value="FULL_SUN">Full sun</option>
              <option value="PARTIAL_SHADE">Partial shade</option>
              <option value="FULL_SHADE">Full shade</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {pending ? "Creating..." : "Create Plot"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
