"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGarden } from "@/lib/garden-actions";

export default function NewGardenPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("slug", slug);
    const result = await createGarden(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-green-800 dark:text-green-400">
            Garden Town
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <div className="mb-6">
          <Link
            href="/gardens"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            &larr; Back to gardens
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-2xl font-semibold">Create a Garden</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Garden Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Riverside Community Garden"
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium">
                URL Slug
              </label>
              <div className="mt-1 flex items-center rounded-md border border-zinc-300 shadow-sm dark:border-zinc-600">
                <span className="px-3 text-sm text-zinc-400">garden-town.com/</span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  readOnly
                  className="block w-full rounded-r-md border-0 px-3 py-2 text-sm focus:outline-none dark:bg-zinc-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
                <span className="ml-1 text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Tell people about your garden..."
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={pending || !slug}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {pending ? "Creating..." : "Create Garden"}
              </button>
              <Link
                href="/gardens"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
