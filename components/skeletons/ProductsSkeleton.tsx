"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="space-y-2 mt-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <Skeleton className="h-4 w-full" />

        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-24" />
      </CardContent>

      <CardFooter className="flex justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
}

export default function ProductsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
