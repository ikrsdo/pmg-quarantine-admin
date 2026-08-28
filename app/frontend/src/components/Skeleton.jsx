export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-2 h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-3 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export function SkeletonList({ count = 6 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
