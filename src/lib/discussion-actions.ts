"use server";

import { getActiveGarden, requireGardenRole } from "./garden";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDiscussion(formData: FormData) {
  const { gardenId, userId } = await getActiveGarden();

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
      gardenId,
      plotId: contextType === "PLOT" ? contextId : null,
      taskId: contextType === "TASK" ? contextId : null,
      authorUserId: userId,
    },
  });

  revalidatePath("/discussions");
  return { id: discussion.id };
}

export async function deleteDiscussion(discussionId: string) {
  const { gardenId, userId, role } = await getActiveGarden();

  const discussion = await db.discussion.findUnique({
    where: { id: discussionId },
  });
  if (!discussion || discussion.gardenId !== gardenId) {
    return { error: "Discussion not found" };
  }

  const isStaff = role === "ADMIN" || role === "COORDINATOR";
  if (discussion.authorUserId !== userId && !isStaff) {
    return { error: "Not authorized" };
  }

  await db.discussion.delete({ where: { id: discussionId } });
  revalidatePath("/discussions");
  return {};
}

export async function addComment(formData: FormData) {
  const { userId } = await getActiveGarden();

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
      authorUserId: userId,
      body,
    },
  });

  revalidatePath(`/discussions/${discussionId}`);
  return {};
}

export async function deleteComment(commentId: string) {
  const { userId, role } = await getActiveGarden();

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) return { error: "Comment not found" };

  const isStaff = role === "ADMIN" || role === "COORDINATOR";
  if (comment.authorUserId !== userId && !isStaff) {
    return { error: "Not authorized" };
  }

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/discussions/${comment.discussionId}`);
  return {};
}
