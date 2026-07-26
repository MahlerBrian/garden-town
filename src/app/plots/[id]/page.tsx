import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { PlotActions } from "./plot-actions";
import { PlantingLogSection } from "./planting-log-section";

export default async function PlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { gardenId, userId, role } = await getActiveGarden();

  const { id } = await params;
  const plot = await db.plot.findUnique({
    where: { id },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
      plantingLogs: {
        orderBy: { datePlanted: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!plot || plot.gardenId !== gardenId) notFound();

  const isOwner = plot.assignedUserId === userId;
  const isStaff = role === "COORDINATOR" || role === "ADMIN";

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/plots"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          &larr; All plots
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plot info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">{plot.label}</h1>
              <StatusBadge status={plot.status} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Size</dt>
                <dd className="mt-0.5 font-medium">{plot.size}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Location</dt>
                <dd className="mt-0.5 font-medium">{plot.location}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Sunlight</dt>
                <dd className="mt-0.5 font-medium">
                  {plot.sunlight.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </dd>
              </div>
              {plot.season && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Season</dt>
                  <dd className="mt-0.5 font-medium">{plot.season}</dd>
                </div>
              )}
            </dl>

            {plot.assignedUser && (
              <div className="mt-4 rounded-md bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
                <p className="text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Assigned to </span>
                  <Link
                    href={`/members/${plot.assignedUser.id}`}
                    className="font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {plot.assignedUser.id === userId
                      ? "you"
                      : plot.assignedUser.name}
                  </Link>
                </p>
              </div>
            )}
          </section>

          {/* Planting Log */}
          <PlantingLogSection
            plotId={plot.id}
            logs={plot.plantingLogs.map((log) => ({
              id: log.id,
              plantName: log.plantName,
              datePlanted: log.datePlanted.toISOString(),
              dateHarvested: log.dateHarvested?.toISOString() ?? null,
              notes: log.notes,
              userName: log.user.name,
              userId: log.userId,
            }))}
            isOwner={isOwner}
            currentUserId={userId}
          />
        </div>

        {/* Sidebar actions */}
        <div className="space-y-6">
          <PlotActions
            plotId={plot.id}
            plotStatus={plot.status}
            isOwner={isOwner}
            isStaff={isStaff}
          />

          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold">Plot History</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
                <dd>{formatDate(plot.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Last updated</dt>
                <dd>{formatDate(plot.updatedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Plants logged</dt>
                <dd>{plot.plantingLogs.length}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AppShell>
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
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.FALLOW}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
