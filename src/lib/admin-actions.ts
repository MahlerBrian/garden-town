"use server";

import { requireGardenRole } from "./garden";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updatePlotStatus(
  plotId: string,
  status: "AVAILABLE" | "RESERVED" | "ACTIVE" | "FALLOW"
) {
  const ctx = await requireGardenRole(["ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot || plot.gardenId !== ctx.gardenId) return { error: "Plot not found" };

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
  const ctx = await requireGardenRole(["ADMIN"]);
  if (ctx.error) return { error: ctx.error };

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
      gardenId: ctx.gardenId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/plots");
  return {};
}

export async function deletePlot(plotId: string) {
  const ctx = await requireGardenRole(["ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot || plot.gardenId !== ctx.gardenId) return { error: "Plot not found" };

  await db.plot.delete({ where: { id: plotId } });

  revalidatePath("/admin");
  revalidatePath("/plots");
  return {};
}

export async function deleteUser(userId: string) {
  const ctx = await requireGardenRole(["ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  if (userId === ctx.userId) {
    return { error: "You cannot remove yourself" };
  }

  await db.gardenMembership.delete({
    where: { userId_gardenId: { userId, gardenId: ctx.gardenId } },
  });

  revalidatePath("/admin");
  revalidatePath("/members");
  return {};
}
