import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { RequestPlotButton } from "./request-plot-button";

export default async function PlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { gardenId, userId, role } = await getActiveGarden();
  const isStaff = role === "ADMIN" || role === "COORDINATOR";

  const { status } = await searchParams;
  const validStatuses = ["AVAILABLE", "RESERVED", "ACTIVE", "FALLOW"];
  const filterStatus = status && validStatuses.includes(status) ? status : null;

  const plots = await db.plot.findMany({
    where: {
      gardenId,
      ...(filterStatus ? { status: filterStatus as "AVAILABLE" | "RESERVED" | "ACTIVE" | "FALLOW" } : {}),
    },
    orderBy: { label: "asc" },
    include: { assignedUser: { select: { id: true, name: true } } },
  });

  const counts = await db.plot.groupBy({
    by: ["status"],
    where: { gardenId },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Garden Plots</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {total} plots total &middot; {countMap["AVAILABLE"] ?? 0} available
          </p>
        </div>
        {isStaff && (
          <Link
            href="/admin/plots"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Manage Plots
          </Link>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex gap-2">
        <FilterTab href="/plots" active={!filterStatus} label="All" count={total} />
        {validStatuses.map((s) => (
          <FilterTab
            key={s}
            href={`/plots?status=${s}`}
            active={filterStatus === s}
            label={s.charAt(0) + s.slice(1).toLowerCase()}
            count={countMap[s] ?? 0}
          />
        ))}
      </div>

      {plots.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {filterStatus
              ? `No ${filterStatus.toLowerCase()} plots found.`
              : "No plots have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plots.map((plot) => (
            <div
              key={plot.id}
              className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <Link
                  href={`/plots/${plot.id}`}
                  className="text-base font-semibold hover:text-green-700 dark:hover:text-green-400"
                >
                  {plot.label}
                </Link>
                <StatusBadge status={plot.status} />
              </div>

              <dl className="mb-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <dt>Size</dt>
                  <dd>{plot.size}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Location</dt>
                  <dd>{plot.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sunlight</dt>
                  <dd>{formatSunlight(plot.sunlight)}</dd>
                </div>
                {plot.season && (
                  <div className="flex justify-between">
                    <dt>Season</dt>
                    <dd>{plot.season}</dd>
                  </div>
                )}
              </dl>

              {plot.assignedUser && (
                <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Assigned to{" "}
                  <Link
                    href={`/members/${plot.assignedUser.id}`}
                    className="font-medium text-zinc-700 hover:text-green-700 dark:text-zinc-300 dark:hover:text-green-400"
                  >
                    {plot.assignedUser.id === userId
                      ? "you"
                      : plot.assignedUser.name}
                  </Link>
                </p>
              )}

              <div className="mt-auto flex gap-2">
                <Link
                  href={`/plots/${plot.id}`}
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-center text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Details
                </Link>
                {plot.status === "AVAILABLE" && (
                  <RequestPlotButton plotId={plot.id} />
                )}
              </div>
            </div>
          ))}
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
    RESERVED: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
    ACTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
    FALLOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.FALLOW}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatSunlight(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
