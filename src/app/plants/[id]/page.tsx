export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Plant {id}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Plant care details, growing info, and companion planting.
      </p>
    </div>
  );
}
