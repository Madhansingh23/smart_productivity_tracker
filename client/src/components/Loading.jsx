export default function Loading({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300 font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
}
