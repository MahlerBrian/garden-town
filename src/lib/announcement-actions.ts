"use server";

import { revalidatePath } from "next/cache";
import { requireGardenRole } from "./garden";
import { db } from "./db";

export async function createAnnouncement(formData: FormData) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const pinned = formData.get("pinned") === "on";

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  await db.announcement.create({
    data: {
      title,
      body,
      pinned,
      gardenId: ctx.gardenId,
      authorUserId: ctx.userId,
    },
  });

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement || announcement.gardenId !== ctx.gardenId) {
    return { error: "Announcement not found." };
  }

  await db.announcement.delete({ where: { id } });

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function togglePin(id: string) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement || announcement.gardenId !== ctx.gardenId) {
    return { error: "Announcement not found." };
  }

  await db.announcement.update({
    where: { id },
    data: { pinned: !announcement.pinned },
  });

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}
