import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { searchPlants } from "@/lib/plant-api";
import { AppShell } from "@/components/app-shell";

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, page } = await searchParams;
  const query = q ?? "";
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const hasQuery = query.trim().length > 0;
  const results = hasQuery
    ? await searchPlants(query, currentPage)
    : { data: [], total: 0, lastPage: 1 };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Plant Library</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Search for plants to learn about care, sunlight, watering, and more.
        </p>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            placeholder="Search by plant name (e.g. tomato, basil, sunflower)..."
            defaultValue={query}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </form>

      {!hasQuery ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            Search for a plant to get started
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            Try &quot;tomato&quot;, &quot;lavender&quot;, or &quot;zucchini&quot;
          </p>
        </div>
      ) : results.data.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No plants found for &quot;{query}&quot;.
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            Try a different name or check your spelling.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {results.total} result{results.total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.data.map((plant) => (
              <Link
                key={plant.id}
                href={`/plants/${plant.id}`}
                className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {plant.default_image?.thumbnail ? (
                  <img
                    src={plant.default_image.thumbnail}
                    alt={plant.common_name}
                    className="h-20 w-20 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-green-50 text-2xl dark:bg-green-900/20">
                    🌱
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-semibold">{plant.common_name}</h2>
                  {plant.scientific_name.length > 0 && (
                    <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
                      {plant.scientific_name[0]}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plant.cycle && <InfoTag label={plant.cycle} />}
                    {plant.watering && <InfoTag label={`Water: ${plant.watering}`} />}
                    {plant.sunlight.length > 0 && (
                      <InfoTag label={plant.sunlight[0]} />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {results.lastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/plants?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {currentPage} of {results.lastPage}
              </span>
              {currentPage < results.lastPage && (
                <Link
                  href={`/plants?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function InfoTag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      {label}
    </span>
  );
}
