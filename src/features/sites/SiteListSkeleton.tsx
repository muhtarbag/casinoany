import { Skeleton } from '@/components/ui/skeleton';

export function SiteListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card border rounded-lg p-4 mb-2">
          <div className="flex items-center gap-4">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-9 h-9" />
              <Skeleton className="w-9 h-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
