"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createDiscussion } from "@/lib/discussion-actions";

export default function NewDiscussionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [contextType, setContextType] = useState("GENERAL");
  const [contextOptions, setContextOptions] = useState<
    { id: string; label: string }[]
  >([]);

  useEffect(() => {
    if (contextType === "PLOT") {
      fetch("/api/context-options?type=plot")
        .then((r) => r.json())
        .then(setContextOptions)
        .catch(() => setContextOptions([]));
    } else if (contextType === "TASK") {
      fetch("/api/context-options?type=task")
        .then((r) => r.json())
        .then(setContextOptions)
        .catch(() => setContextOptions([]));
    } else {
      setContextOptions([]);
    }
  }, [contextType]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await createDiscussion(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else if (result.id) {
      router.push(`/discussions/${result.id}`);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/discussions"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            &larr; Back to discussions
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-2xl font-semibold">New Discussion</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
              />
            </div>

            <div>
              <label
                htmlFor="contextType"
                className="block text-sm font-medium"
              >
                Topic
              </label>
              <select
                id="contextType"
                name="contextType"
                value={contextType}
                onChange={(e) => setContextType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
              >
                <option value="GENERAL">General</option>
                <option value="PLOT">About a plot</option>
                <option value="TASK">About a task</option>
              </select>
            </div>

            {(contextType === "PLOT" || contextType === "TASK") && (
              <div>
                <label
                  htmlFor="contextId"
                  className="block text-sm font-medium"
                >
                  {contextType === "PLOT" ? "Select plot" : "Select task"}
                </label>
                <select
                  id="contextId"
                  name="contextId"
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <option value="">Choose...</option>
                  {contextOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {pending ? "Creating..." : "Create Discussion"}
              </button>
              <Link
                href="/discussions"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
