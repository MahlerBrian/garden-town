import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import type { DiscussionContext } from "@/generated/prisma/client";

const CONTEXT_LABELS: Record<DiscussionContext, string> = {
  GENERAL: "General",
  PLOT: "Plot",
  TASK: "Task",
};

const CONTEXT_COLORS: Record<DiscussionContext, string> = {
  GENERAL:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  PLOT: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  TASK: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
};

export default async function DiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string }>;
}) {
  const { gardenId } = await getActiveGarden();

  const { context } = await searchParams;
  const contextFilter =
    context && ["GENERAL", "PLOT", "TASK"].includes(context)
      ? (context as DiscussionContext)
      : undefined;

  const discussions = await db.discussion.findMany({
    where: { gardenId, ...(contextFilter ? { contextType: contextFilter } : {}) },
    include: {
      author: { select: { id: true, name: true } },
      plot: { select: { id: true, label: true } },
      task: { select: { id: true, title: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await db.discussion.groupBy({
    by: ["contextType"],
    where: { gardenId },
    _count: true,
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.contextType, c._count])
  );
  const total = counts.reduce((s, c) => s + c._count, 0);

  const tabs = [
    { label: "All", value: undefined, count: total },
    { label: "General", value: "GENERAL", count: countMap["GENERAL"] ?? 0 },
    { label: "Plot", value: "PLOT", count: countMap["PLOT"] ?? 0 },
    { label: "Task", value: "TASK", count: countMap["TASK"] ?? 0 },
  ];

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Discussions</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Community conversations about plots, tasks, and more.
          </p>
        </div>
        <Link
          href="/discussions/new"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          New discussion
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => {
          const active = contextFilter === tab.value;
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/discussions?context=${tab.value}`
                  : "/discussions"
              }
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-green-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}{" "}
              <span
                className={
                  active
                    ? "text-green-200"
                    : "text-zinc-400 dark:text-zinc-500"
                }
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {discussions.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No discussions yet. Start one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.map((d) => (
            <Link
              key={d.id}
              href={`/discussions/${d.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{d.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        CONTEXT_COLORS[d.contextType]
                      }`}
                    >
                      {CONTEXT_LABELS[d.contextType]}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>by {d.author.name}</span>
                    <span>
                      {d.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {d.contextType === "PLOT" && d.plot && (
                      <span className="text-green-600 dark:text-green-400">
                        Plot: {d.plot.label}
                      </span>
                    )}
                    {d.contextType === "TASK" && d.task && (
                      <span className="text-blue-600 dark:text-blue-400">
                        Task: {d.task.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                    />
                  </svg>
                  {d._count.comments}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
