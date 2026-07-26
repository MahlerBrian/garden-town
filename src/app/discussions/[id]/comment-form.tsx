"use client";

import { useState, useRef } from "react";
import { addComment } from "@/lib/discussion-actions";
import { useRouter } from "next/navigation";

export function CommentForm({ discussionId }: { discussionId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await addComment(formData);
    if (result.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
      router.refresh();
    }
    setPending(false);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="discussionId" value={discussionId} />
      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Write a comment..."
        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
