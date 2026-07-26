import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { AdminPlotStatus } from "./admin-plot-status";
import { AdminDeletePlot } from "./admin-delete-plot";
import { AdminCreatePlot } from "./admin-create-plot";

export default async function AdminPlotsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const plots = await db.plot.findMany({
    include: {
      assignedUser: { select: { id: true, name: true } },
      _count: { select: { plantingLogs: true } },
    },
    orderBy: { label: "asc" },
  });

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

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Plots</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {plots.length} plot{plots.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Create plot form */}
      <AdminCreatePlot />

      {/* Plots table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Label
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Size
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Location
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Sunlight
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Assigned to
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Plants
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {plots.map((plot) => (
              <tr key={plot.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/plots/${plot.id}`}
                    className="font-medium hover:text-green-700 dark:hover:text-green-400"
                  >
                    {plot.label}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {plot.size}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {plot.location}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {formatSunlight(plot.sunlight)}
                </td>
                <td className="px-4 py-3">
                  <AdminPlotStatus plotId={plot.id} currentStatus={plot.status} />
                </td>
                <td className="px-4 py-3">
                  {plot.assignedUser ? (
                    <Link
                      href={`/members/${plot.assignedUser.id}`}
                      className="text-sm hover:text-green-700 dark:hover:text-green-400"
                    >
                      {plot.assignedUser.name}
                    </Link>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3">{plot._count.plantingLogs}</td>
                <td className="px-4 py-3 text-right">
                  <AdminDeletePlot plotId={plot.id} plotLabel={plot.label} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function formatSunlight(s: string) {
  const labels: Record<string, string> = {
    FULL_SUN: "Full sun",
    PARTIAL_SHADE: "Partial shade",
    FULL_SHADE: "Full shade",
  };
  return labels[s] ?? s;
}
