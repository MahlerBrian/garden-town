"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePlotStatus } from "@/lib/admin-actions";

export function AdminPlotStatus({
  plotId,
  currentStatus,
}: {
  plotId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as "AVAILABLE" | "RESERVED" | "ACTIVE" | "FALLOW";
    if (status === currentStatus) return;
    setPending(true);
    await updatePlotStatus(plotId, status);
    router.refresh();
    setPending(false);
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700"
    >
      <option value="AVAILABLE">Available</option>
      <option value="RESERVED">Reserved</option>
      <option value="ACTIVE">Active</option>
      <option value="FALLOW">Fallow</option>
    </select>
  );
}
