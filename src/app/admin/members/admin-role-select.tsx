"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMemberRole } from "@/lib/member-actions";

export function AdminRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as "GARDENER" | "COORDINATOR" | "ADMIN";
    if (role === currentRole) return;
    setPending(true);
    await updateMemberRole(userId, role);
    router.refresh();
    setPending(false);
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={pending}
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700"
    >
      <option value="GARDENER">Gardener</option>
      <option value="COORDINATOR">Coordinator</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
