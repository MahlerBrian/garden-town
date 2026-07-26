"use server";

import { revalidatePath } from "next/cache";
import { getActiveGarden, requireGardenRole } from "./garden";
import { db } from "./db";

export async function requestPlot(plotId: string) {
  const { gardenId, userId } = await getActiveGarden();

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot || plot.gardenId !== gardenId) return { error: "Plot not found." };
  if (plot.status !== "AVAILABLE") return { error: "Plot is not available." };

  await db.plot.update({
    where: { id: plotId },
    data: { status: "RESERVED", assignedUserId: userId },
  });

  revalidatePath("/plots");
  revalidatePath(`/plots/${plotId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignPlot(plotId: string, userId: string) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot || plot.gardenId !== ctx.gardenId) return { error: "Plot not found." };

  await db.plot.update({
    where: { id: plotId },
    data: { status: "ACTIVE", assignedUserId: userId },
  });

  revalidatePath("/plots");
  revalidatePath(`/plots/${plotId}`);
  return { success: true };
}

export async function releasePlot(plotId: string) {
  const { gardenId, userId, role } = await getActiveGarden();

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot || plot.gardenId !== gardenId) return { error: "Plot not found." };

  const isOwner = plot.assignedUserId === userId;
  const isStaff = role === "COORDINATOR" || role === "ADMIN";
  if (!isOwner && !isStaff) {
    return { error: "You don't have permission to release this plot." };
  }

  await db.plot.update({
    where: { id: plotId },
    data: { status: "AVAILABLE", assignedUserId: null },
  });

  revalidatePath("/plots");
  revalidatePath(`/plots/${plotId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addPlantingLog(formData: FormData) {
  const { userId } = await getActiveGarden();

  const plotId = formData.get("plotId") as string;
  const plantName = formData.get("plantName") as string;
  const datePlanted = formData.get("datePlanted") as string;
  const notes = formData.get("notes") as string | null;

  if (!plotId || !plantName || !datePlanted) {
    return { error: "Plant name and date planted are required." };
  }

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot) return { error: "Plot not found." };
  if (plot.assignedUserId !== userId) {
    return { error: "You can only log plants in your own plots." };
  }

  await db.plantingLog.create({
    data: {
      plotId,
      userId,
      plantName,
      datePlanted: new Date(datePlanted),
      notes: notes || null,
    },
  });

  revalidatePath(`/plots/${plotId}`);
  return { success: true };
}

export async function harvestPlantingLog(logId: string) {
  const { userId } = await getActiveGarden();

  const log = await db.plantingLog.findUnique({ where: { id: logId } });
  if (!log) return { error: "Log entry not found." };
  if (log.userId !== userId) {
    return { error: "You can only update your own planting logs." };
  }

  await db.plantingLog.update({
    where: { id: logId },
    data: { dateHarvested: new Date() },
  });

  revalidatePath(`/plots/${log.plotId}`);
  return { success: true };
}
