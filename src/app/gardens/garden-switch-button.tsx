"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchGarden, joinGarden } from "@/lib/garden-actions";

export function GardenSwitchButton({
  gardenId,
  isJoin = false,
}: {
  gardenId: string;
  isJoin?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    if (isJoin) {
      await joinGarden(gardenId);
    } else {
      await switchGarden(gardenId);
    }
    router.push("/dashboard");
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
      {pending ? "..." : isJoin ? "Join Garden" : "Switch to this garden"}
    </button>
  );
}
