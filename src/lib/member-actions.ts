"use server";

import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import { db } from "./db";

export async function updateMemberRole(
  userId: string,
  role: "GARDENER" | "COORDINATOR" | "ADMIN"
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "ADMIN") {
    return { error: "Only admins can change member roles." };
  }
  if (userId === session.user.id) {
    return { error: "You cannot change your own role." };
  }

  const validRoles = ["GARDENER", "COORDINATOR", "ADMIN"];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role." };
  }

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/members");
  revalidatePath(`/members/${userId}`);
  return { success: true };
}

export async function updateContactVisibility(
  visibility: "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE"
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  await db.user.update({
    where: { id: session.user.id },
    data: { contactVisibility: visibility },
  });

  revalidatePath(`/members/${session.user.id}`);
  return { success: true };
}
