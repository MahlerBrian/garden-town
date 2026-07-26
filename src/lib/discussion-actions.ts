"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDiscussion(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const title = (formData.get("title") as string)?.trim();
  const contextType = (formData.get("contextType") as string) ?? "GENERAL";
  const contextId = (formData.get("contextId") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };
  if (!["GENERAL", "PLOT", "TASK"].includes(contextType)) {
    return { error: "Invalid context type" };
  }

  const discussion = await db.discussion.create({
    data: {
      title,
      contextType: contextType as "GENERAL" | "PLOT" | "TASK",
      plotId: contextType === "PLOT" ? contextId : null,
      taskId: contextType === "TASK" ? contextId : null,
      authorUserId: session.user.id,
    },
  });

  revalidatePath("/discussions");
  return { id: discussion.id };
}

export async function deleteDiscussion(discussionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const discussion = await db.discussion.findUnique({
    where: { id: discussionId },
  });
  if (!discussion) return { error: "Discussion not found" };

  const isStaff = session.user.role === "ADMIN" || session.user.role === "COORDINATOR";
  if (discussion.authorUserId !== session.user.id && !isStaff) {
    return { error: "Not authorized" };
  }

  await db.discussion.delete({ where: { id: discussionId } });
  revalidatePath("/discussions");
  return {};
}

export async function addComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const discussionId = formData.get("discussionId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!body) return { error: "Comment body is required" };

  const discussion = await db.discussion.findUnique({
    where: { id: discussionId },
  });
  if (!discussion) return { error: "Discussion not found" };

  await db.comment.create({
    data: {
      discussionId,
      authorUserId: session.user.id,
      body,
    },
  });

  revalidatePath(`/discussions/${discussionId}`);
  return {};
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) return { error: "Comment not found" };

  const isStaff = session.user.role === "ADMIN" || session.user.role === "COORDINATOR";
  if (comment.authorUserId !== session.user.id && !isStaff) {
    return { error: "Not authorized" };
  }

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/discussions/${comment.discussionId}`);
  return {};
}
