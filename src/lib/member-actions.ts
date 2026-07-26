"use server";

import { revalidatePath } from "next/cache";
import { getActiveGarden } from "./garden";
import { db } from "./db";

export async function updateMemberRole(
  userId: string,
  role: "GARDENER" | "COORDINATOR" | "ADMIN"
) {
  const ctx = await getActiveGarden();
  if (ctx.role !== "ADMIN") {
    return { error: "Only garden admins can change member roles." };
  }
  if (userId === ctx.userId) {
    return { error: "You cannot change your own role." };
  }

  const validRoles = ["GARDENER", "COORDINATOR", "ADMIN"];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role." };
  }

  await db.gardenMembership.update({
    where: { userId_gardenId: { userId, gardenId: ctx.gardenId } },
    data: { role },
  });

  revalidatePath("/members");
  revalidatePath(`/members/${userId}`);
  revalidatePath("/admin/members");
  return { success: true };
}

export async function updateContactVisibility(
  visibility: "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE"
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await getActiveGarden();

  await db.user.update({
    where: { id: userId },
    data: { contactVisibility: visibility },
  });

  revalidatePath(`/members/${userId}`);
  return { success: true };
}
