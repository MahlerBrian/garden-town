import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function AdminReportsPage() {
  const { gardenId, role } = await getActiveGarden();
  if (role !== "ADMIN") redirect("/dashboard");

  const [
    totalUsers,
    totalPlots,
    totalTasks,
    totalSignups,
    totalPlantingLogs,
    totalAnnouncements,
    totalDiscussions,
    totalComments,
    plotsByStatus,
    signupsByStatus,
    tasksByCategory,
    topGardeners,
  ] = await Promise.all([
    db.gardenMembership.count({ where: { gardenId } }),
    db.plot.count({ where: { gardenId } }),
    db.task.count({ where: { gardenId } }),
    db.taskSignup.count({ where: { task: { gardenId } } }),
    db.plantingLog.count({ where: { plot: { gardenId } } }),
    db.announcement.count({ where: { gardenId } }),
    db.discussion.count({ where: { gardenId } }),
    db.comment.count({ where: { discussion: { gardenId } } }),
    db.plot.groupBy({ by: ["status"], where: { gardenId }, _count: true }),
    db.taskSignup.groupBy({ by: ["status"], where: { task: { gardenId } }, _count: true }),
    db.task.groupBy({ by: ["category"], where: { gardenId }, _count: true }),
    db.gardenMembership.findMany({
      where: { gardenId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { plantingLogs: true, taskSignups: true, comments: true },
            },
          },
        },
      },
      orderBy: { user: { taskSignups: { _count: "desc" } } },
      take: 10,
    }),
  ]);

  const plotStatusMap = Object.fromEntries(
    plotsByStatus.map((c) => [c.status, c._count])
  );
  const signupStatusMap = Object.fromEntries(
    signupsByStatus.map((c) => [c.status, c._count])
  );
  const taskCategoryMap = Object.fromEntries(
    tasksByCategory.map((c) => [c.category, c._count])
  );

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          &larr; Admin Panel
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">Reports</h1>

      {/* Overview stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={totalUsers} />
        <StatCard label="Plots" value={totalPlots} />
        <StatCard label="Tasks" value={totalTasks} />
        <StatCard label="Plants logged" value={totalPlantingLogs} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plot status breakdown */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">Plots by Status</h2>
          <div className="space-y-3">
            <BarRow
              label="Available"
              count={plotStatusMap["AVAILABLE"] ?? 0}
              total={totalPlots}
              color="bg-green-500"
            />
            <BarRow
              label="Reserved"
              count={plotStatusMap["RESERVED"] ?? 0}
              total={totalPlots}
              color="bg-amber-500"
            />
            <BarRow
              label="Active"
              count={plotStatusMap["ACTIVE"] ?? 0}
              total={totalPlots}
              color="bg-blue-500"
            />
            <BarRow
              label="Fallow"
              count={plotStatusMap["FALLOW"] ?? 0}
              total={totalPlots}
              color="bg-zinc-400"
            />
          </div>
        </section>

        {/* Task categories */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">Tasks by Category</h2>
          <div className="space-y-3">
            {["WATERING", "WEEDING", "HARVESTING", "MAINTENANCE", "EVENT"].map(
              (cat) => (
                <BarRow
                  key={cat}
                  label={cat.charAt(0) + cat.slice(1).toLowerCase()}
                  count={taskCategoryMap[cat] ?? 0}
                  total={totalTasks}
                  color={categoryColor(cat)}
                />
              )
            )}
          </div>
        </section>

        {/* Volunteer signups */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">Volunteer Signups</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Total signups</dt>
              <dd className="font-medium">{totalSignups}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Completed</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">
                {signupStatusMap["COMPLETED"] ?? 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Signed up</dt>
              <dd className="font-medium text-blue-600 dark:text-blue-400">
                {signupStatusMap["SIGNED_UP"] ?? 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">No shows</dt>
              <dd className="font-medium text-red-600 dark:text-red-400">
                {signupStatusMap["NO_SHOW"] ?? 0}
              </dd>
            </div>
          </dl>
        </section>

        {/* Community engagement */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">Community Engagement</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Announcements posted</dt>
              <dd className="font-medium">{totalAnnouncements}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Discussion threads</dt>
              <dd className="font-medium">{totalDiscussions}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Comments</dt>
              <dd className="font-medium">{totalComments}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">
                Avg comments per discussion
              </dt>
              <dd className="font-medium">
                {totalDiscussions > 0
                  ? (totalComments / totalDiscussions).toFixed(1)
                  : "0"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Top contributors */}
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold">Top Contributors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="pb-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                  Member
                </th>
                <th className="pb-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Task signups
                </th>
                <th className="pb-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Plants logged
                </th>
                <th className="pb-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Comments
                </th>
                <th className="pb-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Total activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {topGardeners.map((m) => {
                const total =
                  m.user._count.taskSignups + m.user._count.plantingLogs + m.user._count.comments;
                return (
                  <tr key={m.user.id}>
                    <td className="py-2">
                      <Link
                        href={`/members/${m.user.id}`}
                        className="font-medium hover:text-green-700 dark:hover:text-green-400"
                      >
                        {m.user.name}
                      </Link>
                    </td>
                    <td className="py-2 text-right">{m.user._count.taskSignups}</td>
                    <td className="py-2 text-right">{m.user._count.plantingLogs}</td>
                    <td className="py-2 text-right">{m.user._count.comments}</td>
                    <td className="py-2 text-right font-medium">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
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

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="font-medium">
          {count}{" "}
          <span className="text-zinc-400 dark:text-zinc-500">
            ({pct.toFixed(0)}%)
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function categoryColor(cat: string) {
  const colors: Record<string, string> = {
    WATERING: "bg-blue-500",
    WEEDING: "bg-amber-500",
    HARVESTING: "bg-green-500",
    MAINTENANCE: "bg-zinc-500",
    EVENT: "bg-purple-500",
  };
  return colors[cat] ?? "bg-zinc-400";
}
