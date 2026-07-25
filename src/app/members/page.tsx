import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, q } = await searchParams;
  const validRoles = ["GARDENER", "COORDINATOR", "ADMIN"];
  const filterRole = role && validRoles.includes(role) ? role : null;

  const members = await db.user.findMany({
    where: {
      ...(filterRole
        ? { role: filterRole as "GARDENER" | "COORDINATOR" | "ADMIN" }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      joinDate: true,
      contactVisibility: true,
      _count: { select: { plots: true, taskSignups: true } },
    },
  });

  const counts = await db.user.groupBy({
    by: ["role"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.role, c._count]));
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {total} members in the community
          </p>
        </div>
      </div>

      {/* Search */}
      <form className="mb-4">
        {filterRole && <input type="hidden" name="role" value={filterRole} />}
        <input
          name="q"
          type="search"
          placeholder="Search by name or email..."
          defaultValue={q ?? ""}
          className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </form>

      {/* Role filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterTab
          href={`/members${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          active={!filterRole}
          label="All"
          count={total}
        />
        {validRoles.map((r) => (
          <FilterTab
            key={r}
            href={`/members?role=${r}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={filterRole === r}
            label={formatRole(r)}
            count={countMap[r] ?? 0}
          />
        ))}
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {q ? `No members matching "${q}".` : "No members found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const showEmail =
              member.contactVisibility === "PUBLIC" ||
              (member.contactVisibility === "MEMBERS_ONLY" && session.user) ||
              member.id === session.user.id ||
              session.user.role === "ADMIN";

            return (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-400">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{member.name}</span>
                    <RoleBadge role={member.role} />
                  </div>
                  {showEmail && (
                    <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {member.email}
                    </p>
                  )}
                  <div className="mt-2 flex gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>{member._count.plots} plots</span>
                    <span>{member._count.taskSignups} tasks</span>
                    <span>Joined {formatDate(member.joinDate)}</span>
                  </div>
                </div>
              </Link>
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

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    GARDENER: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    COORDINATOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[role] ?? ""}`}>
      {formatRole(role)}
    </span>
  );
}

function formatRole(r: string) {
  return r.charAt(0) + r.slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
