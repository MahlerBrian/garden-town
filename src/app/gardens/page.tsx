import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GardenSwitchButton } from "./garden-switch-button";

export default async function GardensPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { activeGardenId: true },
  });

  const memberships = await db.gardenMembership.findMany({
    where: { userId: session.user.id },
    include: {
      garden: {
        select: { id: true, name: true, slug: true, description: true },
        include: { _count: { select: { memberships: true, plots: true } } },
      },
    },
    orderBy: { garden: { name: "asc" } },
  });

  const allGardens = await db.garden.findMany({
    where: {
      id: { notIn: memberships.map((m) => m.gardenId) },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { memberships: true, plots: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-green-800 dark:text-green-400">
            Garden Town
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {session.user.name}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Gardens</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Select a garden to manage, or create a new one.
            </p>
          </div>
          <Link
            href="/gardens/new"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Create Garden
          </Link>
        </div>

        {memberships.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              You haven&apos;t joined any gardens yet.
            </p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Create your own garden or join an existing one below.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships.map((m) => {
              const isActive = m.gardenId === user?.activeGardenId;
              return (
                <div
                  key={m.id}
                  className={`rounded-lg border bg-white p-5 dark:bg-zinc-900 ${
                    isActive
                      ? "border-green-500 ring-1 ring-green-500"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">{m.garden.name}</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        /{m.garden.slug}
                      </p>
                    </div>
                    <RoleBadge role={m.role} />
                  </div>
                  {m.garden.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {m.garden.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{m.garden._count.memberships} members</span>
                    <span>{m.garden._count.plots} plots</span>
                  </div>
                  <div className="mt-4">
                    {isActive ? (
                      <Link
                        href="/dashboard"
                        className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <GardenSwitchButton gardenId={m.gardenId} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other gardens to join */}
        {allGardens.length > 0 && (
          <>
            <h2 className="mb-4 mt-10 text-lg font-semibold">
              Other Gardens
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {allGardens.map((g) => (
                <div
                  key={g.id}
                  className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    /{g.slug}
                  </p>
                  {g.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {g.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{g._count.memberships} members</span>
                    <span>{g._count.plots} plots</span>
                  </div>
                  <div className="mt-4">
                    <GardenSwitchButton gardenId={g.id} isJoin />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
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
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[role] ?? ""}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}
