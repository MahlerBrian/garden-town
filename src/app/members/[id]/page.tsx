export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Member {id}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Member profile and activity.
      </p>
    </div>
  );
}
