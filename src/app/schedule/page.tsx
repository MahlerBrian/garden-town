import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { TaskSignupButton } from "./task-signup-button";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; past?: string }>;
}) {
  const { gardenId, userId, role } = await getActiveGarden();

  const { category, past } = await searchParams;
  const validCategories = ["WATERING", "WEEDING", "HARVESTING", "MAINTENANCE", "EVENT"];
  const filterCategory = category && validCategories.includes(category) ? category : null;
  const showPast = past === "1";

  const tasks = await db.task.findMany({
    where: {
      gardenId,
      ...(filterCategory
        ? { category: filterCategory as "WATERING" | "WEEDING" | "HARVESTING" | "MAINTENANCE" | "EVENT" }
        : {}),
      ...(!showPast ? { date: { gte: new Date() } } : {}),
    },
    orderBy: { date: showPast ? "desc" : "asc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { signups: true } },
    },
  });

  const userSignups = await db.taskSignup.findMany({
    where: { userId },
    select: { taskId: true },
  });
  const signedUpIds = new Set(userSignups.map((s) => s.taskId));

  const counts = await db.task.groupBy({
    by: ["category"],
    where: { gardenId, ...(!showPast ? { date: { gte: new Date() } } : {}) },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.category, c._count]));
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  const isStaff = role === "COORDINATOR" || role === "ADMIN";
  const pastParam = showPast ? "&past=1" : "";

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {showPast ? "All tasks" : "Upcoming tasks"} &middot; {total} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={showPast ? "/schedule" : "/schedule?past=1"}
            className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            {showPast ? "Show upcoming" : "Show past"}
          </Link>
          {isStaff && (
            <Link
              href="/schedule/new"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              New task
            </Link>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterTab
          href={`/schedule${showPast ? "?past=1" : ""}`}
          active={!filterCategory}
          label="All"
          count={total}
        />
        {validCategories.map((c) => (
          <FilterTab
            key={c}
            href={`/schedule?category=${c}${pastParam}`}
            active={filterCategory === c}
            label={formatCategory(c)}
            count={countMap[c] ?? 0}
          />
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {filterCategory
              ? `No ${formatCategory(filterCategory).toLowerCase()} tasks found.`
              : showPast
                ? "No tasks have been created yet."
                : "No upcoming tasks."}
          </p>
          {isStaff && (
            <Link
              href="/schedule/new"
              className="mt-2 inline-block text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400"
            >
              Create the first task
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isPast = new Date(task.date) < new Date();
            const isSignedUp = signedUpIds.has(task.id);

            return (
              <div
                key={task.id}
                className={`rounded-lg border bg-white p-5 transition-shadow hover:shadow-md dark:bg-zinc-900 ${
                  isPast
                    ? "border-zinc-100 opacity-60 dark:border-zinc-800"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/schedule/${task.id}`}
                        className="text-base font-semibold hover:text-green-700 dark:hover:text-green-400"
                      >
                        {task.title}
                      </Link>
                      <CategoryBadge category={task.category} />
                      {task.recurrence && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {formatRecurrence(task.recurrence)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{formatDate(task.date)}</span>
                      <span>{task._count.signups} signed up</span>
                      <span>Created by {task.createdBy.name}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isSignedUp && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400">
                        Signed up
                      </span>
                    )}
                    {!isPast && (
                      <TaskSignupButton
                        taskId={task.id}
                        isSignedUp={isSignedUp}
                      />
                    )}
                    <Link
                      href={`/schedule/${task.id}`}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function FilterTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-green-700 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }`}
    >
      {label} ({count})
    </Link>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    WATERING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    WEEDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    HARVESTING: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    MAINTENANCE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    EVENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[category] ?? ""}`}>
      {formatCategory(category)}
    </span>
  );
}

function formatCategory(c: string) {
  return c.charAt(0) + c.slice(1).toLowerCase();
}

function formatRecurrence(r: string) {
  return r.charAt(0) + r.slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
