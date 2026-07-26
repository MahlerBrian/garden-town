import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getActiveGarden() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { activeGardenId: true },
  });

  if (!user?.activeGardenId) redirect("/gardens");

  const membership = await db.gardenMembership.findUnique({
    where: {
      userId_gardenId: {
        userId: session.user.id,
        gardenId: user.activeGardenId,
      },
    },
    include: { garden: true },
  });

  if (!membership) redirect("/gardens");

  return {
    garden: membership.garden,
    gardenId: membership.gardenId,
    role: membership.role,
    userId: session.user.id,
    session,
  };
}

export async function requireGardenRole(roles: string[]) {
  const ctx = await getActiveGarden();
  if (!roles.includes(ctx.role)) {
    return { ...ctx, error: "Insufficient permissions" as const };
  }
  return { ...ctx, error: null };
}
