import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-green-800 dark:text-green-400"
          >
            Garden Town
          </Link>
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
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="hover:text-green-700 dark:hover:text-green-400">
                Admin
              </Link>
            )}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
