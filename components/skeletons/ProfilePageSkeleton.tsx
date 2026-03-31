"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Divider */}
      <Skeleton className="h-[1px] w-full" />

      {/* Profile Picture Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <Skeleton className="w-24 h-24 rounded-full" />

            {/* Button + text */}
            <div className="space-y-3">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Branch Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
