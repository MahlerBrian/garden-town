export default async function PlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Plot {id}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Plot details, planting log, and assigned member.
      </p>
    </div>
  );
}
