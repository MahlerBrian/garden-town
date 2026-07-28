import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">🌱</div>
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        Nothing&apos;s growing here yet.
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
