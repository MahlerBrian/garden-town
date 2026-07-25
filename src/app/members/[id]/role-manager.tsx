"use client";

import { useState } from "react";
import { updateMemberRole } from "@/lib/member-actions";

export function RoleManager({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    setError(null);
    const result = await updateMemberRole(
      userId,
      e.target.value as "GARDENER" | "COORDINATOR" | "ADMIN"
    );
    if (result.error) setError(result.error);
    setPending(false);
  }

  return (
    <div>
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={pending}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700"
      >
        <option value="GARDENER">Gardener</option>
        <option value="COORDINATOR">Coordinator</option>
        <option value="ADMIN">Admin</option>
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
