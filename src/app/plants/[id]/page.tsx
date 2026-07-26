import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlantById } from "@/lib/plant-api";
import { AppShell } from "@/components/app-shell";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const plantId = parseInt(id, 10);
  if (isNaN(plantId)) notFound();

  const plant = await getPlantById(plantId);
  if (!plant) notFound();

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/plants"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          &larr; Back to search
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              {plant.default_image?.regular_url ? (
                <img
                  src={plant.default_image.regular_url}
                  alt={plant.common_name}
                  className="h-48 w-48 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-lg bg-green-50 text-5xl dark:bg-green-900/20">
                  🌱
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold">{plant.common_name}</h1>
                {plant.scientific_name.length > 0 && (
                  <p className="mt-0.5 text-sm italic text-zinc-500 dark:text-zinc-400">
                    {plant.scientific_name.join(", ")}
                  </p>
                )}
                {plant.family && (
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Family: {plant.family}
                  </p>
                )}
                {plant.description && (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {plant.description}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Growing info */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">Growing Information</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Sunlight" value={plant.sunlight.join(", ") || "—"} />
              <InfoCard label="Watering" value={plant.watering ?? "—"} />
              {plant.watering_general_benchmark && (
                <InfoCard
                  label="Watering frequency"
                  value={`Every ${plant.watering_general_benchmark.value} ${plant.watering_general_benchmark.unit}`}
                />
              )}
              <InfoCard label="Life cycle" value={plant.cycle ?? "—"} />
              <InfoCard label="Growth rate" value={plant.growth_rate ?? "—"} />
              <InfoCard label="Maintenance" value={plant.maintenance ?? "—"} />
              <InfoCard label="Care level" value={plant.care_level ?? "—"} />
              <InfoCard
                label="Drought tolerant"
                value={plant.drought_tolerant ? "Yes" : "No"}
              />
              <InfoCard label="Indoor" value={plant.indoor ? "Yes" : "No"} />
            </div>
          </section>

          {/* Soil & Pruning */}
          {(plant.soil || plant.pruning_month) && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 font-semibold">Soil &amp; Pruning</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {plant.soil && (
                  <InfoCard label="Soil type" value={plant.soil.join(", ")} />
                )}
                {plant.pruning_month && plant.pruning_month.length > 0 && (
                  <InfoCard
                    label="Pruning months"
                    value={plant.pruning_month.join(", ")}
                  />
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick facts */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold">Quick Facts</h2>
            <dl className="space-y-2 text-sm">
              {plant.type && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Type</dt>
                  <dd className="font-medium">{plant.type}</dd>
                </div>
              )}
              {plant.dimension && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Size</dt>
                  <dd className="font-medium">{plant.dimension}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Flowers</dt>
                <dd className="font-medium">
                  {plant.flowers
                    ? plant.flower_color
                      ? `Yes (${plant.flower_color})`
                      : "Yes"
                    : "No"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Edible fruit</dt>
                <dd className="font-medium">
                  {plant.edible_fruit ? "Yes" : "No"}
                </dd>
              </div>
              {plant.harvest_season && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Harvest</dt>
                  <dd className="font-medium">{plant.harvest_season}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Origin */}
          {plant.origin && plant.origin.length > 0 && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">Origin</h2>
              <div className="flex flex-wrap gap-1.5">
                {plant.origin.map((o) => (
                  <span
                    key={o}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Companions */}
          {plant.companions && plant.companions.length > 0 && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">Companion Plants</h2>
              <div className="flex flex-wrap gap-1.5">
                {plant.companions.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
