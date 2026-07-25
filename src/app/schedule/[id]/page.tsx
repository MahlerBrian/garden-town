import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { TaskSignupButton } from "../task-signup-button";
import { TaskDetailActions } from "./task-detail-actions";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const task = await db.task.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      signups: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      },
    },
  });

  if (!task) notFound();

  const isStaff = session.user.role === "COORDINATOR" || session.user.role === "ADMIN";
  const isPast = new Date(task.date) < new Date();
  const isSignedUp = task.signups.some((s) => s.userId === session.user.id);

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/schedule"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          &larr; All tasks
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{task.title}</h1>
                <CategoryBadge category={task.category} />
              </div>
              {!isPast && (
                <TaskSignupButton taskId={task.id} isSignedUp={isSignedUp} />
              )}
            </div>

            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>

            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Date</dt>
                <dd className="mt-0.5 font-medium">{formatDate(task.date)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Recurrence</dt>
                <dd className="mt-0.5 font-medium">
                  {task.recurrence
                    ? task.recurrence.charAt(0) + task.recurrence.slice(1).toLowerCase()
                    : "One-time"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Created by</dt>
                <dd className="mt-0.5 font-medium">{task.createdBy.name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Volunteers</dt>
                <dd className="mt-0.5 font-medium">{task.signups.length}</dd>
              </div>
            </dl>
          </section>

          {/* Signups list */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">Volunteers</h2>
            {task.signups.length === 0 ? (
              <div className="rounded-md bg-zinc-50 px-4 py-8 text-center dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No one has signed up yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      <th className="pb-2 pr-4 font-medium">Name</th>
                      <th className="pb-2 pr-4 font-medium">Email</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      {isStaff && <th className="pb-2 font-medium">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {task.signups.map((signup) => (
                      <tr
                        key={signup.id}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="py-2.5 pr-4">
                          <Link
                            href={`/members/${signup.user.id}`}
                            className="font-medium hover:text-green-700 dark:hover:text-green-400"
                          >
                            {signup.user.name}
                            {signup.userId === session.user.id && (
                              <span className="ml-1 text-xs text-zinc-400">(you)</span>
                            )}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-400">
                          {signup.user.email}
                        </td>
                        <td className="py-2.5 pr-4">
                          <SignupStatusBadge status={signup.status} />
                        </td>
                        {isStaff && (
                          <td className="py-2.5">
                            <TaskDetailActions
                              taskId={task.id}
                              userId={signup.userId}
                              currentStatus={signup.status}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!isPast && !isSignedUp && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">Join This Task</h2>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                Sign up to volunteer for this task.
              </p>
              <TaskSignupButton taskId={task.id} isSignedUp={false} />
            </section>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold">Task Info</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Last updated</dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd className={isPast ? "text-zinc-400" : "text-green-700 dark:text-green-400"}>
                  {isPast ? "Past" : "Upcoming"}
                </dd>
              </div>
            </dl>
          </section>

          {isStaff && (
            <DeleteTaskSection taskId={task.id} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DeleteTaskSection({ taskId }: { taskId: string }) {
  return (
    <section className="rounded-lg border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-zinc-900">
      <h2 className="mb-3 font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
      <form
        action={async () => {
          "use server";
          const { deleteTask } = await import("@/lib/task-actions");
          const { redirect } = await import("next/navigation");
          await deleteTask(taskId);
          redirect("/schedule");
        }}
      >
        <button
          type="submit"
          className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Delete Task
        </button>
      </form>
    </section>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    WATERING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    WEEDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    HARVESTING: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    MAINTENANCE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    EVENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[category] ?? ""}`}>
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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
