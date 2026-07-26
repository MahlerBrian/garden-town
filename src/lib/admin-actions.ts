"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated", session: null };
  if (session.user.role !== "ADMIN") return { error: "Admin access required", session: null };
  return { error: null, session };
}

export async function updatePlotStatus(
  plotId: string,
  status: "AVAILABLE" | "RESERVED" | "ACTIVE" | "FALLOW"
) {
  const { error } = await requireAdmin();
  if (error) return { error };

  await db.plot.update({
    where: { id: plotId },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath("/plots");
  revalidatePath(`/plots/${plotId}`);
  return {};
}

export async function createPlot(formData: FormData) {
  const { error } = await requireAdmin();
  if (error) return { error };

  const label = (formData.get("label") as string)?.trim();
  const size = (formData.get("size") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const sunlight = (formData.get("sunlight") as string) ?? "FULL_SUN";

  if (!label || !size || !location) {
    return { error: "Label, size, and location are required" };
  }

  if (!["FULL_SUN", "PARTIAL_SHADE", "FULL_SHADE"].includes(sunlight)) {
    return { error: "Invalid sunlight value" };
  }

  await db.plot.create({
    data: {
      label,
      size,
      location,
      sunlight: sunlight as "FULL_SUN" | "PARTIAL_SHADE" | "FULL_SHADE",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/plots");
  return {};
}

export async function deletePlot(plotId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot) return { error: "Plot not found" };

  await db.plot.delete({ where: { id: plotId } });

  revalidatePath("/admin");
  revalidatePath("/plots");
  return {};
}

export async function deleteUser(userId: string) {
  const { error, session } = await requireAdmin();
  if (error || !session) return { error: error ?? "Not authenticated" };

  if (userId === session.user.id) {
    return { error: "You cannot delete your own account" };
  }

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  revalidatePath("/members");
  return {};
}
