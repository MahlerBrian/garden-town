import Link from "next/link";
import { getActiveGarden } from "@/lib/garden";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { RequestActions } from "./request-actions";

export default async function AdminRequestsPage() {
  const { gardenId, role } = await getActiveGarden();
  if (role !== "ADMIN") redirect("/dashboard");

  const pendingRequests = await db.joinRequest.findMany({
    where: { gardenId, status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const pastRequests = await db.joinRequest.findMany({
    where: { gardenId, status: { in: ["APPROVED", "REJECTED"] } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
    take: 20,
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

      <h1 className="mb-6 text-2xl font-semibold">Join Requests</h1>

      {/* Pending requests */}
      <section className="mb-8">
        <h2 className="mb-4 font-semibold">
          Pending ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="font-medium">{req.user.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {req.user.email}
                  </p>
                  {req.message && (
                    <p className="mt-1 text-sm italic text-zinc-600 dark:text-zinc-400">
                      &quot;{req.message}&quot;
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    Requested{" "}
                    {req.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <RequestActions requestId={req.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past requests */}
      {pastRequests.length > 0 && (
        <section>
          <h2 className="mb-4 font-semibold">Recent History</h2>
          <div className="space-y-2">
            {pastRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium">{req.user.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {req.user.email}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    req.status === "APPROVED"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  }`}
                >
                  {req.status === "APPROVED" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
