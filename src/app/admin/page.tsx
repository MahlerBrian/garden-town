import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function AdminPage() {
  const { gardenId, role } = await getActiveGarden();
  if (role !== "ADMIN" && role !== "COORDINATOR") {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  const [
    userCount,
    plotCounts,
    taskCount,
    announcementCount,
    discussionCount,
    commentCount,
    recentUsers,
  ] = await Promise.all([
    db.gardenMembership.count({ where: { gardenId } }),
    db.plot.groupBy({ by: ["status"], where: { gardenId }, _count: true }),
    db.task.count({ where: { gardenId } }),
    db.announcement.count({ where: { gardenId } }),
    db.discussion.count({ where: { gardenId } }),
    db.comment.count({
      where: { discussion: { gardenId } },
    }),
    db.gardenMembership.findMany({
      where: { gardenId },
      include: { user: { select: { id: true, name: true, email: true, joinDate: true } } },
      orderBy: { user: { joinDate: "desc" } },
      take: 5,
    }),
  ]);

  const plotCountMap = Object.fromEntries(
    plotCounts.map((c) => [c.status, c._count])
  );
  const totalPlots = plotCounts.reduce((s, c) => s + c._count, 0);

  const roleCounts = await db.gardenMembership.groupBy({
    by: ["role"],
    where: { gardenId },
    _count: true,
  });
  const roleCountMap = Object.fromEntries(
    roleCounts.map((c) => [c.role, c._count])
  );

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Garden overview, member management, and settings.
        </p>
      </div>

      {/* Quick stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={userCount} />
        <StatCard label="Total Plots" value={totalPlots} />
        <StatCard label="Active Plots" value={plotCountMap["ACTIVE"] ?? 0} />
        <StatCard label="Available Plots" value={plotCountMap["AVAILABLE"] ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity summary */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">Activity Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Tasks created</dt>
              <dd className="font-medium">{taskCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Announcements</dt>
              <dd className="font-medium">{announcementCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Discussions</dt>
              <dd className="font-medium">{discussionCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Comments</dt>
              <dd className="font-medium">{commentCount}</dd>
            </div>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Reserved plots</dt>
              <dd className="font-medium">{plotCountMap["RESERVED"] ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Fallow plots</dt>
              <dd className="font-medium">{plotCountMap["FALLOW"] ?? 0}</dd>
            </div>
          </dl>
        </section>

        {/* Membership breakdown */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">Membership Breakdown</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Gardeners</span>
              </dt>
              <dd className="font-medium">{roleCountMap["GARDENER"] ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Coordinators</span>
              </dt>
              <dd className="font-medium">{roleCountMap["COORDINATOR"] ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Admins</span>
              </dt>
              <dd className="font-medium">{roleCountMap["ADMIN"] ?? 0}</dd>
            </div>
          </dl>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Newest Members
          </h3>
          <ul className="space-y-2">
            {recentUsers.map((m) => (
              <li key={m.user.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/members/${m.user.id}`}
                  className="font-medium hover:text-green-700 dark:hover:text-green-400"
                >
                  {m.user.name}
                </Link>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {m.user.joinDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Admin sections nav */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/members"
          className="rounded-lg border border-zinc-200 bg-white p-6 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-lg font-semibold">Manage Members</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Roles, accounts, and access
          </p>
        </Link>
        <Link
          href="/admin/plots"
          className="rounded-lg border border-zinc-200 bg-white p-6 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-lg font-semibold">Manage Plots</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create, edit, and configure plots
          </p>
        </Link>
        <Link
          href="/admin/reports"
          className="rounded-lg border border-zinc-200 bg-white p-6 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-lg font-semibold">Reports</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Usage and activity reports
          </p>
        </Link>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
