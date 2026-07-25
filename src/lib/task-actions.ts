"use server";

import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import { db } from "./db";

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can create tasks." };
  }

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
      createdByUserId: session.user.id,
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can delete tasks." };
  }

  await db.task.delete({ where: { id: taskId } });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function signUpForTask(taskId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const existing = await db.taskSignup.findUnique({
    where: { taskId_userId: { taskId, userId: session.user.id } },
  });
  if (existing) return { error: "You're already signed up for this task." };

  await db.taskSignup.create({
    data: { taskId, userId: session.user.id },
  });

  revalidatePath("/schedule");
  revalidatePath(`/schedule/${taskId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function withdrawFromTask(taskId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  await db.taskSignup.delete({
    where: { taskId_userId: { taskId, userId: session.user.id } },
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
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return { error: "Only coordinators and admins can update signup status." };
  }

  await db.taskSignup.update({
    where: { taskId_userId: { taskId, userId } },
    data: { status },
  });

  revalidatePath(`/schedule/${taskId}`);
  return { success: true };
}
