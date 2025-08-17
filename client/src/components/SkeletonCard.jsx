export default function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow animate-pulse">
      <div className="h-4 w-1/3 bg-neutral-300 dark:bg-neutral-700 rounded mb-3"></div>
      <div className="h-3 w-full bg-neutral-300 dark:bg-neutral-700 rounded mb-2"></div>
      <div className="h-3 w-5/6 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
    </div>
  );
}
