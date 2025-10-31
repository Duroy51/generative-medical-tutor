// app/loading.tsx — skeleton global / loader
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl animate-pulse space-y-4">
        <div className="h-8 bg-surface rounded w-3/5" />
        <div className="h-6 bg-surface rounded w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="h-48 bg-surface rounded" />
          <div className="h-48 bg-surface rounded" />
          <div className="h-48 bg-surface rounded" />
        </div>
      </div>
    </div>
  );
}
