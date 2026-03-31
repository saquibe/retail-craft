"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SupplierCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 flex-1">
        {/* Email */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 rounded-full mt-1" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>

        {/* Date */}
        <Skeleton className="h-3 w-32 mt-auto" />
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
}

export default function SuppliersSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SupplierCardSkeleton key={i} />
      ))}
    </div>
  );
}
