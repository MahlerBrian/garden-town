"use server";

import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import { db } from "./db";

export async function createAnnouncement(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can post announcements." };
  }

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
      authorUserId: session.user.id,
    },
  });

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can delete announcements." };
  }

  await db.announcement.delete({ where: { id } });

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function togglePin(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can pin announcements." };
  }

  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement) return { error: "Announcement not found." };

  await db.announcement.update({
    where: { id },
    data: { pinned: !announcement.pinned },
  });

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}
