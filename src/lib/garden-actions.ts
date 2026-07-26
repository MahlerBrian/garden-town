"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createGarden(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !slug) return { error: "Name and slug are required" };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens" };
  }

  const existing = await db.garden.findUnique({ where: { slug } });
  if (existing) return { error: "A garden with this slug already exists" };

  const garden = await db.garden.create({
    data: { name, slug, description },
  });

  await db.gardenMembership.create({
    data: {
      userId: session.user.id,
      gardenId: garden.id,
      role: "ADMIN",
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { activeGardenId: garden.id },
  });

  revalidatePath("/gardens");
  return { gardenId: garden.id };
}

export async function switchGarden(gardenId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const membership = await db.gardenMembership.findUnique({
    where: {
      userId_gardenId: { userId: session.user.id, gardenId },
    },
  });
  if (!membership) return { error: "You are not a member of this garden" };

  await db.user.update({
    where: { id: session.user.id },
    data: { activeGardenId: gardenId },
  });

  revalidatePath("/");
  return {};
}

export async function requestToJoinGarden(gardenId: string, message?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const garden = await db.garden.findUnique({ where: { id: gardenId } });
  if (!garden) return { error: "Garden not found" };

  const existingMembership = await db.gardenMembership.findUnique({
    where: { userId_gardenId: { userId: session.user.id, gardenId } },
  });
  if (existingMembership) return { error: "You are already a member" };

  const existingRequest = await db.joinRequest.findUnique({
    where: { userId_gardenId: { userId: session.user.id, gardenId } },
  });
  if (existingRequest?.status === "PENDING") {
    return { error: "You already have a pending request" };
  }
  if (existingRequest?.status === "REJECTED") {
    await db.joinRequest.update({
      where: { id: existingRequest.id },
      data: { status: "PENDING", message: message || null },
    });
    revalidatePath("/gardens");
    return { requested: true };
  }

  await db.joinRequest.create({
    data: {
      userId: session.user.id,
      gardenId,
      message: message || null,
    },
  });

  revalidatePath("/gardens");
  return { requested: true };
}

export async function approveJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const joinRequest = await db.joinRequest.findUnique({
    where: { id: requestId },
  });
  if (!joinRequest || joinRequest.status !== "PENDING") {
    return { error: "Request not found or already handled" };
  }

  const myMembership = await db.gardenMembership.findUnique({
    where: { userId_gardenId: { userId: session.user.id, gardenId: joinRequest.gardenId } },
  });
  if (!myMembership || myMembership.role !== "ADMIN") {
    return { error: "Only garden admins can approve requests" };
  }

  await db.$transaction([
    db.joinRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    }),
    db.gardenMembership.create({
      data: {
        userId: joinRequest.userId,
        gardenId: joinRequest.gardenId,
        role: "GARDENER",
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/members");
  return {};
}

export async function rejectJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const joinRequest = await db.joinRequest.findUnique({
    where: { id: requestId },
  });
  if (!joinRequest || joinRequest.status !== "PENDING") {
    return { error: "Request not found or already handled" };
  }

  const myMembership = await db.gardenMembership.findUnique({
    where: { userId_gardenId: { userId: session.user.id, gardenId: joinRequest.gardenId } },
  });
  if (!myMembership || myMembership.role !== "ADMIN") {
    return { error: "Only garden admins can reject requests" };
  }

  await db.joinRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin");
  return {};
}

export async function leaveGarden(gardenId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const membership = await db.gardenMembership.findUnique({
    where: {
      userId_gardenId: { userId: session.user.id, gardenId },
    },
  });
  if (!membership) return { error: "You are not a member" };

  await db.gardenMembership.delete({
    where: { id: membership.id },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { activeGardenId: true },
  });
  if (user?.activeGardenId === gardenId) {
    await db.user.update({
      where: { id: session.user.id },
      data: { activeGardenId: null },
    });
  }

  revalidatePath("/gardens");
  return {};
}

export async function updateMemberGardenRole(
  userId: string,
  gardenId: string,
  role: "GARDENER" | "COORDINATOR" | "ADMIN"
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const myMembership = await db.gardenMembership.findUnique({
    where: {
      userId_gardenId: { userId: session.user.id, gardenId },
    },
  });
  if (!myMembership || myMembership.role !== "ADMIN") {
    return { error: "Only garden admins can change roles" };
  }
  if (userId === session.user.id) {
    return { error: "You cannot change your own role" };
  }

  await db.gardenMembership.update({
    where: { userId_gardenId: { userId, gardenId } },
    data: { role },
  });

  revalidatePath("/admin/members");
  revalidatePath("/members");
  return {};
}

export async function removeMemberFromGarden(userId: string, gardenId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const myMembership = await db.gardenMembership.findUnique({
    where: {
      userId_gardenId: { userId: session.user.id, gardenId },
    },
  });
  if (!myMembership || myMembership.role !== "ADMIN") {
    return { error: "Only garden admins can remove members" };
  }
  if (userId === session.user.id) {
    return { error: "You cannot remove yourself" };
  }

  await db.gardenMembership.delete({
    where: { userId_gardenId: { userId, gardenId } },
  });

  revalidatePath("/admin/members");
  revalidatePath("/members");
  return {};
}
