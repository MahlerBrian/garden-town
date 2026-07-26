"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDiscussion } from "@/lib/discussion-actions";

export function DiscussionActions({
  discussionId,
}: {
  discussionId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteDiscussion(discussionId);
    router.push("/discussions");
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {showConfirm ? (
        <>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {pending ? "Deleting..." : "Confirm delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      )}
    </div>
  );
}
