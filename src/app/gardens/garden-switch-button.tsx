"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchGarden, requestToJoinGarden } from "@/lib/garden-actions";

export function GardenSwitchButton({
  gardenId,
  isJoin = false,
  requestStatus,
}: {
  gardenId: string;
  isJoin?: boolean;
  requestStatus?: "PENDING" | "REJECTED" | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [requested, setRequested] = useState(requestStatus === "PENDING");

  async function handleClick() {
    setPending(true);
    if (isJoin) {
      const result = await requestToJoinGarden(gardenId);
      if (result.requested) {
        setRequested(true);
      }
      setPending(false);
    } else {
      await switchGarden(gardenId);
      router.push("/dashboard");
    }
  }

  if (requested) {
    return (
      <span className="inline-block rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
        Request Pending
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        isJoin
          ? "border border-green-600 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {pending ? "..." : isJoin ? "Request to Join" : "Switch to this garden"}
    </button>
  );
}
