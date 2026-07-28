import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { SignOutButton } from "./sign-out-button";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { garden, gardenId, role, session } = await getActiveGarden();

  const isStaff = role === "ADMIN" || role === "COORDINATOR";

  const pendingRequestCount = isStaff
    ? await db.joinRequest.count({ where: { gardenId, status: "PENDING" } })
    : 0;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-green-800 dark:text-green-400"
            >
              Garden Town
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <Link
              href="/gardens"
              className="text-sm font-medium text-zinc-600 hover:text-green-700 dark:text-zinc-400 dark:hover:text-green-400"
              title="Switch garden"
            >
              {garden.name}
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/plots" className="hover:text-green-700 dark:hover:text-green-400">
              Plots
            </Link>
            <Link href="/schedule" className="hover:text-green-700 dark:hover:text-green-400">
              Schedule
            </Link>
            <Link href="/members" className="hover:text-green-700 dark:hover:text-green-400">
              Members
            </Link>
            <Link href="/plants" className="hover:text-green-700 dark:hover:text-green-400">
              Plants
            </Link>
            <Link href="/announcements" className="hover:text-green-700 dark:hover:text-green-400">
              Announcements
            </Link>
            <Link href="/discussions" className="hover:text-green-700 dark:hover:text-green-400">
              Discussions
            </Link>
            {isStaff && (
              <Link href="/admin" className="relative hover:text-green-700 dark:hover:text-green-400">
                Admin
                {pendingRequestCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white">
                    {pendingRequestCount}
                  </span>
                )}
              </Link>
            )}
            <SignOutButton />
          </nav>
          <span className="ml-auto text-base font-semibold text-green-800 dark:text-green-400">
            {session.user?.name}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
