"use client";

import { useState } from "react";
import { updateContactVisibility } from "@/lib/member-actions";

export function VisibilityManager({
  currentVisibility,
}: {
  currentVisibility: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    setError(null);
    const result = await updateContactVisibility(
      e.target.value as "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE"
    );
    if (result.error) setError(result.error);
    setPending(false);
  }

  return (
    <div>
      <select
        defaultValue={currentVisibility}
        onChange={handleChange}
        disabled={pending}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700"
      >
        <option value="PUBLIC">Public — anyone can see</option>
        <option value="MEMBERS_ONLY">Members only — logged-in members</option>
        <option value="PRIVATE">Private — only you and admins</option>
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
