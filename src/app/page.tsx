export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-8 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-green-800 dark:text-green-400">
          Garden Town
        </h1>
        <p className="max-w-md text-center text-lg text-zinc-600 dark:text-zinc-400">
          Manage your community garden — plots, tasks, members, and plants — all
          in one place.
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-full border border-green-700 px-6 py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-950"
          >
            Join Now
          </a>
        </div>
      </main>
    </div>
  );
}
