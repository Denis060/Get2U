export default function SkeletonOrderCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4">
      <div className="h-10 w-10 shrink-0 rounded-lg skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded skeleton-shimmer" />
        <div className="h-3 w-24 rounded skeleton-shimmer" />
      </div>
      <div className="h-6 w-16 rounded-full skeleton-shimmer" />
    </div>
  );
}
