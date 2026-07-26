"use client";

import { useState } from "react";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/garden-actions";
import { useRouter } from "next/navigation";

export function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [handled, setHandled] = useState<"approved" | "rejected" | null>(null);

  async function handleApprove() {
    setPending(true);
    const result = await approveJoinRequest(requestId);
    if (!result.error) {
      setHandled("approved");
    }
    setPending(false);
    router.refresh();
  }

  async function handleReject() {
    setPending(true);
    const result = await rejectJoinRequest(requestId);
    if (!result.error) {
      setHandled("rejected");
    }
    setPending(false);
    router.refresh();
  }

  if (handled === "approved") {
    return (
      <span className="text-sm font-medium text-green-600 dark:text-green-400">
        Approved
      </span>
    );
  }
  if (handled === "rejected") {
    return (
      <span className="text-sm font-medium text-red-600 dark:text-red-400">
        Rejected
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={pending}
        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={pending}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Reject
      </button>
    </div>
  );
}
