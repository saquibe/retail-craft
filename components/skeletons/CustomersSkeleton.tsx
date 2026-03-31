import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg space-y-3 flex flex-col"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>

            <Skeleton className="h-4 w-full" />

            <div className="mt-auto pt-4 flex justify-end gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
