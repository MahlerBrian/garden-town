import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [plots, tasks, announcements] = await Promise.all([
    db.plot.findMany({
      where: { assignedUserId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    db.task.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
      include: {
        _count: { select: { signups: true } },
      },
    }),
    db.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const taskSignups = tasks.length
    ? await db.taskSignup.findMany({
        where: {
          userId: session.user.id,
          taskId: { in: tasks.map((t) => t.id) },
        },
        select: { taskId: true },
      })
    : [];
  const signedUpTaskIds = new Set(taskSignups.map((s) => s.taskId));

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome back, {session.user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Here&apos;s what&apos;s happening in your garden.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Plots */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">My Plots</h2>
            <Link
              href="/plots"
              className="text-sm text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              View all
            </Link>
          </div>
          {plots.length === 0 ? (
            <div className="rounded-md bg-zinc-50 px-4 py-8 text-center dark:bg-zinc-800/50">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No plots assigned yet.
              </p>
              <Link
                href="/plots"
                className="mt-2 inline-block text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400"
              >
                Browse available plots
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {plots.map((plot) => (
                <li key={plot.id}>
                  <Link
                    href={`/plots/${plot.id}`}
                    className="block rounded-md border border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{plot.label}</span>
                      <PlotStatusBadge status={plot.status} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {plot.size} &middot; {plot.location}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming Tasks */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Upcoming Tasks</h2>
            <Link
              href="/schedule"
              className="text-sm text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              Full schedule
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="rounded-md bg-zinc-50 px-4 py-8 text-center dark:bg-zinc-800/50">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No upcoming tasks.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-md border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(task.date)} &middot;{" "}
                        {task._count.signups} signed up
                      </p>
                    </div>
                    <CategoryBadge category={task.category} />
                  </div>
                  {signedUpTaskIds.has(task.id) && (
                    <span className="mt-1.5 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400">
                      You&apos;re signed up
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Announcements */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Announcements</h2>
            <Link
              href="/announcements"
              className="text-sm text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              View all
            </Link>
          </div>
          {announcements.length === 0 ? (
            <div className="rounded-md bg-zinc-50 px-4 py-8 text-center dark:bg-zinc-800/50">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No announcements yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className="rounded-md border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.pinned && (
                      <span className="shrink-0 text-xs text-amber-600 dark:text-amber-400">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {a.body}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {a.author.name} &middot; {formatDate(a.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function PlotStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
    RESERVED: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
    ACTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
    FALLOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.FALLOW}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    WATERING: "text-blue-600 dark:text-blue-400",
    WEEDING: "text-amber-600 dark:text-amber-400",
    HARVESTING: "text-green-600 dark:text-green-400",
    MAINTENANCE: "text-zinc-600 dark:text-zinc-400",
    EVENT: "text-purple-600 dark:text-purple-400",
  };
  return (
    <span className={`shrink-0 text-xs font-medium ${styles[category] ?? ""}`}>
      {category.charAt(0) + category.slice(1).toLowerCase()}
    </span>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
