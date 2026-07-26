import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { RoleManager } from "./role-manager";
import { VisibilityManager } from "./visibility-manager";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { gardenId, userId, role: myRole } = await getActiveGarden();

  const { id } = await params;
  const member = await db.user.findUnique({
    where: { id },
    include: {
      plots: {
        select: { id: true, label: true, status: true, size: true },
        orderBy: { label: "asc" },
      },
      taskSignups: {
        take: 10,
        orderBy: { task: { date: "desc" } },
        include: {
          task: { select: { id: true, title: true, category: true, date: true } },
        },
      },
      _count: {
        select: {
          plots: true,
          plantingLogs: true,
          taskSignups: true,
          announcements: true,
          comments: true,
        },
      },
    },
  });

  if (!member) notFound();

  const membership = await db.gardenMembership.findUnique({
    where: { userId_gardenId: { userId: member.id, gardenId } },
  });
  if (!membership) notFound();

  const isSelf = member.id === userId;
  const isAdmin = myRole === "ADMIN";
  const memberRole = membership.role;

  const showEmail =
    member.contactVisibility === "PUBLIC" ||
    member.contactVisibility === "MEMBERS_ONLY" ||
    isSelf ||
    isAdmin;

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/members"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          &larr; All members
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-800 dark:bg-green-900/40 dark:text-green-400">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold">{member.name}</h1>
                  <RoleBadge role={memberRole} />
                  {isSelf && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      You
                    </span>
                  )}
                </div>
                {showEmail && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {member.email}
                  </p>
                )}
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Member since {formatDateLong(member.joinDate)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <StatCard label="Plots" value={member._count.plots} />
              <StatCard label="Plants logged" value={member._count.plantingLogs} />
              <StatCard label="Tasks" value={member._count.taskSignups} />
              <StatCard label="Announcements" value={member._count.announcements} />
              <StatCard label="Comments" value={member._count.comments} />
            </div>
          </section>

          {/* Assigned Plots */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">Assigned Plots</h2>
            {member.plots.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No plots assigned.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {member.plots.map((plot) => (
                  <Link
                    key={plot.id}
                    href={`/plots/${plot.id}`}
                    className="flex items-center justify-between rounded-md border border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <div>
                      <span className="font-medium">{plot.label}</span>
                      <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {plot.size}
                      </span>
                    </div>
                    <PlotStatusBadge status={plot.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Tasks */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">Recent Task Activity</h2>
            {member.taskSignups.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No task activity yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {member.taskSignups.map((signup) => (
                  <li
                    key={signup.id}
                    className="flex items-center justify-between rounded-md border border-zinc-100 px-4 py-2.5 dark:border-zinc-800"
                  >
                    <div>
                      <Link
                        href={`/schedule/${signup.task.id}`}
                        className="text-sm font-medium hover:text-green-700 dark:hover:text-green-400"
                      >
                        {signup.task.title}
                      </Link>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(signup.task.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={signup.task.category} />
                      <SignupStatusBadge status={signup.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {isSelf && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">Privacy</h2>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                Control who can see your email address.
              </p>
              <VisibilityManager currentVisibility={member.contactVisibility} />
            </section>
          )}

          {isAdmin && !isSelf && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">Role Management</h2>
              <RoleManager userId={member.id} currentRole={memberRole} />
            </section>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold">Contact</h2>
            <dl className="space-y-2 text-sm">
              {showEmail ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
                  <dd className="mt-0.5 font-medium">{member.email}</dd>
                </div>
              ) : (
                <p className="text-zinc-400 dark:text-zinc-500">
                  Contact info is private.
                </p>
              )}
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Visibility</dt>
                <dd className="mt-0.5 font-medium">
                  {formatVisibility(member.contactVisibility)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-zinc-50 px-3 py-2 text-center dark:bg-zinc-800/50">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    GARDENER: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    COORDINATOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[role] ?? ""}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
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
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.FALLOW}`}>
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
    <span className={`text-xs font-medium ${styles[category] ?? ""}`}>
      {category.charAt(0) + category.slice(1).toLowerCase()}
    </span>
  );
}

function SignupStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SIGNED_UP: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    NO_SHOW: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };
  const labels: Record<string, string> = {
    SIGNED_UP: "Signed up",
    COMPLETED: "Completed",
    NO_SHOW: "No show",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

function formatVisibility(v: string) {
  const labels: Record<string, string> = {
    PUBLIC: "Public",
    MEMBERS_ONLY: "Members only",
    PRIVATE: "Private",
  };
  return labels[v] ?? v;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateLong(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
