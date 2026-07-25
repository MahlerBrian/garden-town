"use server";

import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import { db } from "./db";

export async function requestPlot(plotId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot) return { error: "Plot not found." };
  if (plot.status !== "AVAILABLE") return { error: "Plot is not available." };

  await db.plot.update({
    where: { id: plotId },
    data: { status: "RESERVED", assignedUserId: session.user.id },
  });

  revalidatePath("/plots");
  revalidatePath(`/plots/${plotId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignPlot(plotId: string, userId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can assign plots." };
  }

  await db.plot.update({
    where: { id: plotId },
    data: { status: "ACTIVE", assignedUserId: userId },
  });

  revalidatePath("/plots");
  revalidatePath(`/plots/${plotId}`);
  return { success: true };
}

export async function releasePlot(plotId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot) return { error: "Plot not found." };

  const isOwner = plot.assignedUserId === session.user.id;
  const isStaff = session.user.role === "COORDINATOR" || session.user.role === "ADMIN";
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
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const plotId = formData.get("plotId") as string;
  const plantName = formData.get("plantName") as string;
  const datePlanted = formData.get("datePlanted") as string;
  const notes = formData.get("notes") as string | null;

  if (!plotId || !plantName || !datePlanted) {
    return { error: "Plant name and date planted are required." };
  }

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot) return { error: "Plot not found." };
  if (plot.assignedUserId !== session.user.id) {
    return { error: "You can only log plants in your own plots." };
  }

  await db.plantingLog.create({
    data: {
      plotId,
      userId: session.user.id,
      plantName,
      datePlanted: new Date(datePlanted),
      notes: notes || null,
    },
  });

  revalidatePath(`/plots/${plotId}`);
  return { success: true };
}

export async function harvestPlantingLog(logId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const log = await db.plantingLog.findUnique({ where: { id: logId } });
  if (!log) return { error: "Log entry not found." };
  if (log.userId !== session.user.id) {
    return { error: "You can only update your own planting logs." };
  }

  await db.plantingLog.update({
    where: { id: logId },
    data: { dateHarvested: new Date() },
  });

  revalidatePath(`/plots/${log.plotId}`);
  return { success: true };
}
