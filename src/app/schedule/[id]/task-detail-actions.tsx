"use client";

import { useState } from "react";
import { updateSignupStatus } from "@/lib/task-actions";

export function TaskDetailActions({
  taskId,
  userId,
  currentStatus,
}: {
  taskId: string;
  userId: string;
  currentStatus: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleUpdate(status: "COMPLETED" | "NO_SHOW") {
    setPending(true);
    await updateSignupStatus(taskId, userId, status);
    setPending(false);
  }

  if (currentStatus === "COMPLETED" || currentStatus === "NO_SHOW") {
    return (
      <span className="text-xs text-zinc-400 dark:text-zinc-500">
        Already marked
      </span>
    );
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleUpdate("COMPLETED")}
        disabled={pending}
        className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/20"
      >
        Complete
      </button>
      <button
        onClick={() => handleUpdate("NO_SHOW")}
        disabled={pending}
        className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        No show
      </button>
    </div>
  );
}
