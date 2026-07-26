import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { CommentForm } from "./comment-form";
import { DiscussionActions } from "./discussion-actions";
import { CommentActions } from "./comment-actions";
import type { DiscussionContext } from "@/generated/prisma/client";

const CONTEXT_LABELS: Record<DiscussionContext, string> = {
  GENERAL: "General",
  PLOT: "Plot",
  TASK: "Task",
};

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const discussion = await db.discussion.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      plot: { select: { id: true, label: true } },
      task: { select: { id: true, title: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!discussion) notFound();

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "COORDINATOR";
  const isAuthor = discussion.authorUserId === session.user.id;

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/discussions"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          &larr; Back to discussions
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discussion header */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{discussion.title}</h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {discussion.author.name}
                  </span>
                  <span>
                    {discussion.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              {(isAuthor || isStaff) && (
                <DiscussionActions discussionId={discussion.id} />
              )}
            </div>
          </section>

          {/* Comments */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {discussion.comments.length} comment
              {discussion.comments.length !== 1 ? "s" : ""}
            </h2>

            {discussion.comments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No comments yet. Be the first to reply!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {discussion.comments.map((comment) => {
                  const canDelete =
                    comment.authorUserId === session.user!.id || isStaff;
                  return (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-400">
                            {comment.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium">
                            {comment.author.name}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500">
                            {comment.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {canDelete && (
                          <CommentActions commentId={comment.id} />
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add comment */}
            <CommentForm discussionId={discussion.id} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold">Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Topic</dt>
                <dd className="font-medium">
                  {CONTEXT_LABELS[discussion.contextType]}
                </dd>
              </div>
              {discussion.contextType === "PLOT" && discussion.plot && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Plot</dt>
                  <dd>
                    <Link
                      href={`/plots/${discussion.plot.id}`}
                      className="font-medium text-green-600 hover:underline dark:text-green-400"
                    >
                      {discussion.plot.label}
                    </Link>
                  </dd>
                </div>
              )}
              {discussion.contextType === "TASK" && discussion.task && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Task</dt>
                  <dd>
                    <Link
                      href={`/schedule/${discussion.task.id}`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {discussion.task.title}
                    </Link>
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Started by</dt>
                <dd>
                  <Link
                    href={`/members/${discussion.author.id}`}
                    className="font-medium hover:underline"
                  >
                    {discussion.author.name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Replies</dt>
                <dd className="font-medium">{discussion.comments.length}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
