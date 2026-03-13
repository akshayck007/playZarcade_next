import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content Skeleton */}
        <div className="space-y-8">
          {/* Game Window Skeleton */}
          <Skeleton className="aspect-video w-full rounded-3xl" />

          {/* Action Bar Skeleton */}
          <div className="flex items-center justify-between glass p-4 rounded-2xl">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          {/* Game Info Skeleton */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="aspect-video w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="space-y-8">
          <Skeleton className="h-[600px] w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </aside>
      </div>
    </div>
  );
}
