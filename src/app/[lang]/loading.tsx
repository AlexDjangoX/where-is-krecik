export default function Loading() {
  return (
    <div
      className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4"
      aria-busy="true"
    >
      <div className="size-16 rounded-full bg-lime-300/80 motion-safe:animate-pulse dark:bg-lime-800/80" />
    </div>
  );
}
