export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">{description}</p>
      )}
    </div>
  );
}
