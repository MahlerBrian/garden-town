"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/admin-actions";

export function AdminDeleteUser({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteUser(userId);
    router.refresh();
    setPending(false);
    setShowConfirm(false);
  }

  return showConfirm ? (
    <div className="flex items-center gap-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Delete {userName}?
      </span>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        {pending ? "..." : "Yes"}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        No
      </button>
    </div>
  ) : (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      Delete
    </button>
  );
}
