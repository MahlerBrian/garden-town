import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { AdminRoleSelect } from "./admin-role-select";
import { AdminDeleteUser } from "./admin-delete-user";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { gardenId, userId, role: myRole } = await getActiveGarden();
  if (myRole !== "ADMIN") redirect("/dashboard");

  const { q, role } = await searchParams;
  const query = q?.trim() ?? "";
  const roleFilter =
    role && ["GARDENER", "COORDINATOR", "ADMIN"].includes(role)
      ? (role as "GARDENER" | "COORDINATOR" | "ADMIN")
      : undefined;

  const memberships = await db.gardenMembership.findMany({
    where: {
      gardenId,
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(query
        ? {
            user: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          joinDate: true,
          _count: { select: { plots: true, taskSignups: true } },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  const members = memberships.map((m) => ({
    ...m.user,
    role: m.role,
  }));

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
        <h1 className="text-2xl font-semibold">Manage Members</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search and filter */}
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          type="search"
          placeholder="Search by name or email..."
          defaultValue={query}
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
        <select
          name="role"
          defaultValue={roleFilter ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="">All roles</option>
          <option value="GARDENER">Gardener</option>
          <option value="COORDINATOR">Coordinator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Filter
        </button>
      </form>

      {/* Members table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Plots
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Tasks
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {members.map((m) => {
              const isSelf = m.id === userId;
              return (
                <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/members/${m.id}`}
                      className="font-medium hover:text-green-700 dark:hover:text-green-400"
                    >
                      {m.name}
                    </Link>
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-zinc-400">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {m.email}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <RoleBadge role={m.role} />
                    ) : (
                      <AdminRoleSelect userId={m.id} currentRole={m.role} />
                    )}
                  </td>
                  <td className="px-4 py-3">{m._count.plots}</td>
                  <td className="px-4 py-3">{m._count.taskSignups}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {m.joinDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && <AdminDeleteUser userId={m.id} userName={m.name} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
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
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}
