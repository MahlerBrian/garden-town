"use client";

import { useState } from "react";
import { signUpForTask, withdrawFromTask } from "@/lib/task-actions";

export function TaskSignupButton({
  taskId,
  isSignedUp,
}: {
  taskId: string;
  isSignedUp: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    if (isSignedUp) {
      await withdrawFromTask(taskId);
    } else {
      await signUpForTask(taskId);
    }
    setPending(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        isSignedUp
          ? "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {pending
        ? isSignedUp
          ? "Withdrawing..."
          : "Signing up..."
        : isSignedUp
          ? "Withdraw"
          : "Sign up"}
    </button>
  );
}
