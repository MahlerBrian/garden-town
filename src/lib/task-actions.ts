"use server";

import { revalidatePath } from "next/cache";
import { getActiveGarden, requireGardenRole } from "./garden";
import { db } from "./db";

export async function createTask(formData: FormData) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const date = formData.get("date") as string;
  const recurrence = (formData.get("recurrence") as string) || null;

  if (!title || !description || !category || !date) {
    return { error: "Title, description, category, and date are required." };
  }

  const validCategories = ["WATERING", "WEEDING", "HARVESTING", "MAINTENANCE", "EVENT"];
  if (!validCategories.includes(category)) {
    return { error: "Invalid category." };
  }

  const validRecurrences = ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"];
  if (recurrence && !validRecurrences.includes(recurrence)) {
    return { error: "Invalid recurrence." };
  }

  await db.task.create({
    data: {
      title,
      description,
      category: category as "WATERING" | "WEEDING" | "HARVESTING" | "MAINTENANCE" | "EVENT",
      date: new Date(date),
      recurrence: recurrence as "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | null,
      gardenId: ctx.gardenId,
      createdByUserId: ctx.userId,
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || task.gardenId !== ctx.gardenId) return { error: "Task not found." };

  await db.task.delete({ where: { id: taskId } });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function signUpForTask(taskId: string) {
  const { gardenId, userId } = await getActiveGarden();

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || task.gardenId !== gardenId) return { error: "Task not found." };

  const existing = await db.taskSignup.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });
  if (existing) return { error: "You're already signed up for this task." };

  await db.taskSignup.create({
    data: { taskId, userId },
  });

  revalidatePath("/schedule");
  revalidatePath(`/schedule/${taskId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function withdrawFromTask(taskId: string) {
  const { userId } = await getActiveGarden();

  await db.taskSignup.delete({
    where: { taskId_userId: { taskId, userId } },
  });

  revalidatePath("/schedule");
  revalidatePath(`/schedule/${taskId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSignupStatus(
  taskId: string,
  userId: string,
  status: "COMPLETED" | "NO_SHOW"
) {
  const ctx = await requireGardenRole(["COORDINATOR", "ADMIN"]);
  if (ctx.error) return { error: ctx.error };

  await db.taskSignup.update({
    where: { taskId_userId: { taskId, userId } },
    data: { status },
  });

  revalidatePath(`/schedule/${taskId}`);
  return { success: true };
}
