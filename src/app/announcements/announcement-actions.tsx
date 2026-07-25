"use client";

import { useState } from "react";
import { deleteAnnouncement, togglePin } from "@/lib/announcement-actions";

export function AnnouncementActions({
  announcementId,
  isPinned,
}: {
  announcementId: string;
  isPinned: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handlePin() {
    setPending(true);
    await togglePin(announcementId);
    setPending(false);
  }

  async function handleDelete() {
    setPending(true);
    await deleteAnnouncement(announcementId);
    setPending(false);
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        onClick={handlePin}
        disabled={pending}
        className="rounded px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
      >
        {isPinned ? "Unpin" : "Pin"}
      </button>
      {showConfirm ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
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
