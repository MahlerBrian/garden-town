import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { AnnouncementActions } from "./announcement-actions";

export default async function AnnouncementsPage() {
  const { gardenId, role } = await getActiveGarden();

  const isStaff = role === "COORDINATOR" || role === "ADMIN";

  const announcements = await db.announcement.findMany({
    where: { gardenId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { id: true, name: true } } },
  });

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isStaff && (
          <Link
            href="/announcements/new"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            New announcement
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No announcements yet.
          </p>
          {isStaff && (
            <Link
              href="/announcements/new"
              className="mt-2 inline-block text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400"
            >
              Post the first announcement
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article
              key={a.id}
              className={`rounded-lg border bg-white p-6 dark:bg-zinc-900 ${
                a.pinned
                  ? "border-amber-200 dark:border-amber-900/50"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {a.pinned && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      Pinned
                    </span>
                  )}
                  <h2 className="text-lg font-semibold">{a.title}</h2>
                </div>
                {isStaff && (
                  <AnnouncementActions
                    announcementId={a.id}
                    isPinned={a.pinned}
                  />
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {a.body}
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                <Link
                  href={`/members/${a.author.id}`}
                  className="font-medium text-zinc-600 hover:text-green-700 dark:text-zinc-400 dark:hover:text-green-400"
                >
                  {a.author.name}
                </Link>
                <span>{formatDate(a.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
