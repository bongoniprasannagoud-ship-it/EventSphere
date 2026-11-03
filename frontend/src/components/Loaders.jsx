export function EventCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 skeleton rounded-lg w-3/4" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-2/3" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 skeleton rounded w-1/2" />
          <div className="h-3 skeleton rounded w-1/3" />
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <div className="h-4 skeleton rounded w-16" />
          <div className="h-4 skeleton rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-mono">Loading...</p>
      </div>
    </div>
  );
}
